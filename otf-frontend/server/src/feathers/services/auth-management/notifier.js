/*  Copyright (c) 2019 AT&T Intellectual Property.                             #
#                                                                              #
#   Licensed under the Apache License, Version 2.0 (the "License");            #
#   you may not use this file except in compliance with the License.           #
#   You may obtain a copy of the License at                                    #
#                                                                              #
#       http://www.apache.org/licenses/LICENSE-2.0                             #
#                                                                              #
#   Unless required by applicable law or agreed to in writing, software        #
#   distributed under the License is distributed on an "AS IS" BASIS,          #
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
#   See the License for the specific language governing permissions and        #
#   limitations under the License.                                             #
##############################################################################*/


var env = require('config').env;

module.exports = function(app) {

	function getLink(type, hash) {
		const url = app.get('otf').url + "account/" + type + '?token=' + hash;
		return url
	}

	function sendEmail(email) {
		var environment = env.toUpperCase();
		email.subject = "Open Test Framework (" + environment + ") - " + email.subject;
		return app.service(app.get('base-path') + 'mailer').create(email).then(function (result) {
			console.log('Sent email', result)
		}).catch(err => {
			console.log('Error sending email: ', email, err)
		})
	}

	return {
		notifier: function(type, user, notifierOptions) {
			let tokenLink;
			let email;
			let sender = app.get('otf').email;
			switch (type) {
				case 'resendVerifySignup': //sending the user the verification email
					tokenLink = getLink('verify', user.verifyToken)
					email = {
						from: sender,
						to: user['email'],
						subject: 'Verify Signup',
						html: 'Please verify your email address by clicking the link below.' + '</br>' + tokenLink

					}
					return sendEmail(email)
					break

				case 'verifySignup': // confirming verification
					let adminLink = app.get('otf').url + 'user-management?filter=' + user['email'];

					email = {
						from: sender,
						to: user['email'],
						subject: 'Signup Confirmed',
						html: 'Thanks for verifying your email!' + '</br>' + 'You will be notified when an admin enables your account.'
					}

					let adminEmail = {
						from: sender,
						to: sender,
						subject: 'Approve Verified User',
						html:   'User has verified their email.' + '</br>' +
								'Details: ' + '</br>' +
								'   Email: ' + user['email'] + '</br>' +
								'   First Name: ' + user['firstName'] + '</br>' +
								'   Last Name: ' + user['lastName'] + '</br>' +
								'</br>' +
								'Enable their account by visiting ' + '</br>' + adminLink
					}
					sendEmail(adminEmail);
					return sendEmail(email);
					break

				case 'sendApprovalNotification':
					email = {
						from: sender,
						to: user['email'],
						subject: 'Approved',
						html:   'Your account has been approved for access.' + '</br>' +
								'You can now log into the OTF website: ' + app.get('otf').url

					}
					return sendEmail(email);
					break

				case 'sendResetPwd':
					tokenLink = getLink('reset', user.resetToken)
					email = {}
					return sendEmail(email)
					break

				case 'resetPwd':
					tokenLink = getLink('reset', user.resetToken)
					email = {}
					return sendEmail(email)
					break

				case 'passwordChange':
					email = {}
					return sendEmail(email)
					break

				case 'identityChange':
					tokenLink = getLink('verifyChanges', user.verifyToken)
					email = {}
					return sendEmail(email)
					break

				default:
					break
			}
		}
	}
}
