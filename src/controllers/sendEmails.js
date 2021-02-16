"use strict";
const nodemailer = require("nodemailer");

exports.sendEmail = (receivingUserEmail, titulo, subject, messagePrimaryUser, messageSecondaryUser, messagePrimary, messageSecondary) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            // transportador
            let transporter = nodemailer.createTransport({
                host: process.env.HOSTEMAIL,
                secure: true,
                port: 465, // 465 secure
                auth: {
                    user: process.env.EMAILUSER,
                    pass: process.env.PASSUSER
                },
                tls: {
                    rejectUnauthorized: false
                }
            })
    
            // correo al usuario que realizó el pago
            let mailOptions = {
                from: process.env.EMAILUSER,
                to: receivingUserEmail,
                subject: 'Compra de membresia',
                html: `
                    <div style="background: #EFF3EE; font-family: sans-serif; border-radius: 5px;">
                        <h2 style="background: #56F338; padding: 2px 10px; border-radius: 5px; font-weight: 600; margin: 0;">${titulo}</h2>
                        <div style="padding: 0 5px 2px 5px;">
                            <h3>${messagePrimaryUser}</h3>
                            <p>${messageSecondaryUser}</p>
                        </div>
                    </div>
                `
            }

            // correo al administrador de la app
            let mailOptions2 = {
                from: process.env.EMAILUSER,
                to: process.env.EMAILUSERPERSONAL,
                subject,
                html: `
                    <div style="background: #EFF3EE; font-family: sans-serif; border-radius: 5px;">
                        <h2 style="background: #56F338; padding: 2px 10px; border-radius: 5px; font-weight: 600; margin: 0;">${titulo}</h2>
                        <div style="padding: 0 5px 2px 5px;">
                            <h3>${messagePrimary}</h3>
                            <p>${messageSecondary}</p>
                        </div>
                    </div>
                `
            }
        
            await transporter.sendMail(mailOptions)
                .catch(err =>{
                    console.log(err);
                    return reject('Error al enviar el correo al usuario')
                })

            await transporter.sendMail(mailOptions2)
                .catch(err =>{
                    console.log(err)
                    return reject('Error al enviar el correo al administrador de la app')
                })

            return resolve('Mails sends')
        } catch (error) {
            return reject('Error inesperado'), console.log(error);
        }
    })
}