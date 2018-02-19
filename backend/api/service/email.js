/**
 * Email service.
 * Compiles emails and pushes to an email web service.
 */
const Promise = require('bluebird');
const Nodemailer = require('nodemailer');
const Log = require('./log');
const Config = require('./config');
const Mustache = require('mustache');
const Juice = require('juice');
const Alert = require("../model/alert");
const Fs = Promise.promisifyAll(require('fs'));

class Email {
  /**
   * Generate test SMTP service account from ethereal.email
   * Only needed if you don't have a real mail account for testing
   */
  constructor() {
    // create reusable transporter object using the default SMTP transport
    this.config = Config.get('email');
    this.baseUrl = Config.get('general.domain');
    this.transporter = Nodemailer.createTransport(this.config.options);
    this.templates = {};
    //
  }

  /** 
   * Init the class and load the template files.
   */
  init() {
    const templateDir = `${__dirname}/email/`;
    let templates = {},
      wrapper,
      promises = [];
    return Fs.readdirAsync(templateDir)
      .map(file => Fs.readFileAsync(templateDir + file, 'utf-8').then(content => [file, content]))
      .then((contents) => {
        // map files
        contents.map((content) => {
          if (!content[1]) {
            Log.error('Email template empty', templateDir + file, err);
            return;
          }
          const key = content[0].split('.')[0];
          if (key == 'wrapper') {
            wrapper = content[1];
          } else {
            templates[key] = content[1];
          }
        });

        // build templates
        for (const key in templates) {
          const title = templates[key].match(/<title[^>]*>((.|[\n\r])*)<\/title>/im)[1];
          const body = templates[key].match(/<body[^>]*>((.|[\n\r])*)<\/body>/im)[1];
          const html = Mustache.render(wrapper, {
            body,
          });

          this.templates[key] = {
            title,
            body: Juice(html),
          };
          Log.info('Loaded template', key);
        }
      })
      .catch((err) => {
        Log.error('Email cannot load templates', err);
      });
  }

  newSignUp(person) {
    const token = person.getActivationToken();
    let templateProperties = {
      url: Config.get("general.domain") + "alerts?activate=" + token
    };
    templateProperties = Object.assign(templateProperties, person.toJSON());
    // setup email data with unicode symbols
    return this.sendWithTemplate(this.templates.newSignUp, templateProperties);
  }

  newPlanAlert(data) {
    let alert = new Alert({
      id: data.alert_id,
      person_id: data.person_id
    });
    data.unsubscribeLink = `${this.baseUrl}unsubscribe/?token=${alert.unsubsribeToken()}`;
    return this.sendWithTemplate(this.templates.alert, data);
  }

  newAlert(person, alert) {
    const templateProperties = Object.assign({}, person, alert.toJSON());
    return this.sendWithTemplate(this.templates.newAlert, templateProperties);
  }

  resetPasswordToken(person) {
    const templateProperties = {
      email: person.get('email'),
      url: `${Config.get('general.domain')}password/reset/?token=${person.resetPasswordToken()}`,
    };
    return this.sendWithTemplate(this.templates.resetPasswordToken, templateProperties);
  }

  sendWithTemplate(template, templateProperties) {
    return this.send({
      from: `"${this.config.from_name}" <${this.config.from_email}>`, // sender address
      to: templateProperties.email, // list of receivers
      subject: Mustache.render(template.title, templateProperties), // Subject line
      html: Mustache.render(template.body, templateProperties), // html body
    });
  }

  /**
   * send mail with defined transport object
   * @param {*} mailOptions 
   */
  send(mailOptions) {
    
    return this.transporter.sendMail(mailOptions)
      .then(info => Log.info('Message sent: %s', info.messageId, mailOptions.to));

  }
}
module.exports = new Email();