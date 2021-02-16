const User = require('../models/User');
const { activateUserCurrent } = require('../controllers/activarUserController');
const { sendEmail } = require('../controllers/sendEmails');
const { updateToken } = require('../jwt/jwt');

exports.pago = async (req, res) =>{
    try {
        const epayco = require('epayco-node')({
            apiKey: process.env.PUBLICKEYEPAYCO, // llave pública
            privateKey: process.env.PRIVATEKEYEPAYCO, // llave privada
            lang: 'ES',
            test: true
        })
    
        let { city, address, numberCard, expYearCard, expMonthCard, cvcCard, docType, docNumber } = req.body
    
        // valida que todos los datos lleguen por el body
        if(!city || !address || !numberCard || !expYearCard || !expMonthCard || !cvcCard || !docType || !docNumber){
            return res.status(401).json({
                ok: false,
                message: 'Todos los campos son requeridos'
            })
        }else{
            // Comprobar que todos los datos sean Strings
            if(typeof city === 'string' && typeof address === 'string' && typeof numberCard === 'string' && typeof expYearCard === 'string' &&
            typeof expMonthCard === 'string' && typeof cvcCard === 'string' && typeof docType === 'string' && typeof docNumber === 'string'){
                // limipiar los espacios en blanco a los lados de los datos
                city.trim(), address.trim(), numberCard.trim(), expYearCard.trim(), expMonthCard.trim(), cvcCard.trim(), docType.trim(), docNumber.trim()
            }else{
                return res.status(401).json({
                    ok: false,
                    message: 'Formato de los datos inválidos, todos deben ser cadenas de texto'
                })
            }
        }
    
        // Valida la ciudad contildes, pueden ser 4 nombres entre espacios
        // ejemplo: my ciudad de residencia
        if(!/^([a-zA-ZÀ-ÿ]{1,25}\s?)([a-zA-ZÀ-ÿ]{1,25}\s?)?([a-zA-ZÀ-ÿ]{1,25}\s?)?([a-zA-ZÀ-ÿ]{1,25})?$/.test(city)){
            return res.status(401).json({
                ok: false,
                message: 'Ciudad inválida'
            })
        }
        
        // valida dirección con tildes, #, números y que no sea mayor a 60 caracteres
        if(!/^([a-zA-ZÀ-ÿ0-9#\/&_.,:;-]\s?){1,60}$/g.test(address)) return res.status(401).json({
            ok: false,
            message: 'Dirección inválida'
        })
    
        if(!/^[0-9]{14,18}$/.test(Number(numberCard))) return res.status(401).json({
            ok: false,
            message: 'Número de tarjeta inválido'
        })
    
        if(!/^2[0-9]{3}$/.test(Number(expYearCard))) return res.status(401).json({
            ok: false,
            message: 'Año de expiración inválido'
        })
    
        if(typeof Number(expMonthCard) != 'number' || Number(expMonthCard) < 1 || Number(expMonthCard) > 12) return res.status(400).json({
            ok: false,
            message: 'Mes de expiracion inválido'
        })
    
        if(!/^[0-9]{3}$/.test(Number(cvcCard))) return res.status(401).json({
            ok: false,
            message: 'Código de seguridad inválido'
        })
    
        if(!/^[a-zA-Z]{2,4}$/.test(docType)) return res.status(401).json({
            ok: false,
            message: 'Tipo de documento inválido'
        })
    
        if(!/^[0-9]{7,15}$/.test(Number(docNumber))) return res.status(401).json({
            ok: false,
            message: 'Número de documento inválido'
        })
    
        let user = await User.findOne({ email: req.session.user.email })
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: 'Error inesperado'
                })
            })
    
        // si no hay usuario en la sesión no puede hacer el pago
        if(!user) return res.status(404).json({
            ok: false,
            message: 'No se encontró un usuairo para realizar el pago'
        })
        
        // información de la tarjeta
        let credit_info = {
            "card[number]": numberCard,
            "card[exp_year]": expYearCard,
            "card[exp_month]": expMonthCard,
            "card[cvc]": cvcCard
        }
        
        // crea el token de epayco
        let token = await epayco.token.create(credit_info)
            .catch(function(err) {
                console.log("err: " + err);
            });
        
        // manejo de error cuando los datos de la tarjeta sean inválidos
        if(token.status === false){
            if(token.data.errors == 'Bin credit card no valid.'){
                return res.status(401).json({
                    ok: false,
                    message: 'Número de tarjeta inválido'
                })
            }
            return res.status(401).json({
                ok: false,
                message: token.data.errors
            })
        }
    
        // información de cliente
        let customer_info = {
            token_card: token.id,
            name: user.name,
            last_name: user.lastName, 
            email: user.email,
            default: true,
            //Optional parameters: These parameters are important when validating the credit card transaction
            city: city,
            address: address,
            cell_phone: user.phone.toString()
        }
    
        // creación del cliente con epayco
        let customer = await epayco.customers.create(customer_info)
            .catch(function(err) {
                console.log("err: " + err);
            });
        
        // manejo de errores cuando los datos del cliente sean inválidos
        if(customer.status === false){
            return res.status(401).json({
                ok: false,
                message: 'error validando datos campos requeridos o inválidos'
            })
        }
    
        // información del pago
        let payment_info = {
            token_card: token.id,
            customer_id: customer.data.customerId,
            doc_type: docType,
            doc_number: docNumber,
            name: user.name,
            last_name: user.lastName,
            email: user.email,
            bill: "membresia-0",
            description: "Membresia Great Style FX Academy",
            value: "51",
            tax: "0",
            tax_base: "0",
            currency: "USD",
            dues: "1",
            cell_phone: user.phone.toString(),
            ip: req.connection.remoteAddress, /*This is the client's IP, it is required */
            url_response: "http://localhost:4200/response",
            url_confirmation: "http://localhost:4200/response",
            test: true
        }
        
        // pago con epayco
        let charge = await epayco.charge.create(payment_info)
            .catch(function(err) {
                console.log("err: " + err);
            })
        
        // pago pendiente
        if(charge.data.estado === 'Pendiente'){
            // coloca el usuario pendiente en la DB
            let rpt = await activateUserCurrent(user, charge.data.estado)
                .catch(err =>{
                    return res.status(500).json({
                        ok: false,
                        message: err
                    })
                })

            // información que se enviará por correo
            let titulo = "Pago Pendiente";
            let subject = "Cuenta Pendiente para activación";
            let messagePrimaryUser = "Tu pago a greatStyleFx está pendiente, contáctese con el administrador de la app para pedir la activación de su cuenta cuando su pago se haya confirmado";
            let messageSecondaryUser = "debe estar atento a la confirmación del pago para pedir la activación de su cuenta";
            let messagePrimary = `El usuario ${user.email} ha realizado un pago a la plataforma greatStyleFx, sin embargo ha quedado pendiente`;
            let messageSecondary = "Debe estar atento si el usuario se contacta con usted para pedir la activación de la cuenta";

            // Envía un correo al usuario indicando que su pago está pendiente
            await sendEmail(user.email, titulo, subject, messagePrimaryUser, messageSecondaryUser, messagePrimary, messageSecondary)
                .catch(err =>{
                    console.log(err)
                    return res.status(500).json({
                        ok: false,
                        message: err
                    })
                })
            return res.status(200).json({
                ok: true,
                message: rpt
                // message: 'Su compra está pendiente, puede revisar su correo para verificar cuando se le informe si su compra fué aceptada o rechazada'
            })
        }

        let ok = charge.data.estado === 'Aceptada' ? true : false

        // Compra Realizada
        if(ok){
            // activa el usuario en la DB
            let rpt = await activateUserCurrent(user, charge.data.estado)
                .catch(err =>{
                    console.log(err)
                    return res.status(500).json({
                        ok: false,
                        message: err
                    })
                })

            // información que se enviará por correo
            let titulo = "Pago Realizado";
            let subject = "Confirmar cuenta";
            let messagePrimaryUser = "Has realizado un pago a greatStyleFx, su cuenta será activada si no ha ocurrido ningún error con el pago";
            let messageSecondaryUser = "Verifique su cuenta en unos minutos para que pueda confirmar si su cuenta fué activada, sino contactese con soporte para solucionarlo";
            let messagePrimary = `El usuario ${user.email} ha realizado un pago a la plataforma greatStyleFx`
            let messageSecondary = "El usuario ha sido activado, verificar si ha sido activado, sino porfavor activarlo"
    
            // envía un correo al usuario diciendo que su pago se realizó
            await sendEmail(user.email, titulo, subject, messagePrimaryUser, messageSecondaryUser, messagePrimary, messageSecondary)
                .catch(err =>{
                    console.log(err)
                    return res.status(500).json({
                        ok: false,
                        message: err
                    })
                })

            let payload = {
                id: rpt.newUser._id,
                name: rpt.newUser.name,
                lastName: rpt.newUser.lastName,
                email: rpt.newUser.email,
                activo: rpt.newUser.active
            }

            let token = await updateToken(payload)
                .catch(err =>{
                    console.log(err)
                    return res.status(500).json({
                        ok: false,
                        message: err
                    })
                })

            return res.status(200).json({
                ok: true,
                message: `su compra fue ${charge.data.estado}, ${rpt.message}`,
                token
                // message: 'Compra realizada pero ocurrió un error inesperado al activar el usuario, comuniquese con soporte para solucionar ésto'
            })
        }

        // información que se enviará por correo
        let titulo = "Pago Rechazado";
        let subject = "Pago de Cuenta Rechazado";
        let messagePrimaryUser = "Su pago a greatStyleFx fué rechazado, su cuenta no será activada";
        let messageSecondaryUser = "Puede verificar sus datos de pago he intentar realizar el pago de nuevo";
        let messagePrimary = `El usuario ${user.email} intento hacer un pago en la plataforma greatStyleFx, sin embargo se rechazó`;
        let messageSecondary = "El usuario no será activado, verifique que el usuario está desactivado, sino por favor desactivar";

        // Envía un correo al usuario avisandole que su pago fué rechazado
        await sendEmail(user.email, titulo, subject, messagePrimaryUser, messageSecondaryUser, messagePrimary, messageSecondary)
            .catch(err =>{
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    message: err
                })
            })
        
        return res.status(200).json({
            ok,
            message: `su compra fue ${charge.data.estado}`
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado realizando el pago'
        })
    }
}