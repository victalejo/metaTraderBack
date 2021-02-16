const path = require('path');
const MetaApi = require('metaapi.cloud-sdk');
const { CopyFactory } = require('metaapi.cloud-sdk');
const { SynchronizationListener } = require('metaapi.cloud-sdk');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const metaApi = MetaApi.default;

const token = process.env.TOKEN;

const api = new metaApi(token);
const copyFactory = new CopyFactory(token);

// Funcion que detecta los cambios en las posiciones
exports.changePosition = async () => {
    try {
        let userFound = await User.findOne({ role: 'Admin' })
            .catch(err => console.log(err) )
        let account = await api.metatraderAccountApi.getAccount(userFound.idAccountMTC);
    
        const connection = await account.connect()
    
        // acceder a la copia local del estado de la terminal
        const terminalState = connection.terminalState;
    
        await connection.waitSynchronized()
        
        let n = 1
        let p = terminalState.positions
        // id de la posicion a elminar
        // let pId = p[0] ? p[0].id : ''
        
        // primero, implementamos su listener
        class MySynchronizationListener extends SynchronizationListener {
            // anular los metodos abstractos para los que desee recibir notificaciones

            // detecta la actualizacion de una posicion
            async onPositionUpdated(n, p) {
                console.log(terminalState.positions);
                // id de la posicion a elminar
                // pId = terminalState.positions[0] ? terminalState.positions[0].id : ''
                let users = await User.find({ role: 'Cliente' })
                    .catch(err => console.log(err) )

                for (const user in users) {
                    let active = user.isActive()
                    if(typeof active === 'object'){
                        removeStrategyToCopy(user.email)
                            .then( async rpt =>{
                                await User.updateOne({ email: user.email }, { active: active.active, activeTime: active.time }, { new: true })
                                    .catch(err => console.log(err) )
                                return true
                            })
                            .catch(err => console.log(err) )
                    }
                }
            }
            
            // detecta la eliminacion de una posicion
            // async onPositionRemoved(n, pId){
            //     console.log(terminalState.positions);
            // }
        }
    
        // ahora añadimos el usuario
        const listener = new MySynchronizationListener();
        
        connection.addSynchronizationListener(listener);
    } catch (error) {
        console.log(error);
    }
}

// Añade un nuevo usuario a metaapi
exports.añadirUsuario = (email, loginU, passwordU) =>{
    return new Promise(async (resolve, reject) =>{
        try {
            const provisioningProfile = await api.provisioningProfileApi.createProvisioningProfile({
                name: 'copy trade',
                version: 5,
                brokerTimezone: 'GMT-0',
                brokerDSTSwitchTimezone: 'GMT-0'
              });
            
            await provisioningProfile.uploadFile('servers.dat', path.join(__dirname, '../', 'config', 'files', 'Deriv-Demo.servers.dat'))
                .catch(err =>{
                    console.log(err);
                    return reject('Hubo un error al subir el archivo del perfil')
                })
    
            let userCreate = await api.metatraderAccountApi.createAccount({
                name: 'copy trade',
                type: 'cloud-g1',
                login: loginU,
                password: passwordU,
                server: 'Deriv-Demo',
                provisioningProfileId: provisioningProfile.id,
                application: 'CopyFactory',
                magic: 1
            })

            // let user = await User.findOne({ email })
            // if(user.role === 'Admin'){
                // let pass = bcrypt.hashSync(user.password, 10)
                // let passM = bcrypt.hashSync(user.passMT5, 10)

                // await User.findOneAndUpdate({ email: user.email }, { idAccountMTC: userCreate.id, password: pass, passMT5: passM, active: true })
                    // .catch(err =>{
                    //     console.log(err);
                    //     return reject('Error inesperado')
                    // })

                // return resolve('usuario creado')
            // }

            // guardar en la DB el usuario creado (id)
            await User.findOneAndUpdate({ email }, { idAccountMTC: userCreate.id })
                .catch(err =>{
                    console.log(err);
                    return reject('Error inesperado')
                })
            return resolve('usuario creado')
        } catch (error) {
            console.error(error);
            reject('ocurrió un error al crear el usuario vinculado con meta trader')
        }
    })
}

exports.addUserToCopyAdmin = (user) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            const masterMetaapiAccount = await api.metatraderAccountApi.getAccount(user.idAccountMTC);
        
            // Cree cuentas maestras y esclavas de CopyFactory y conéctelas a cuentas MetaApi a través del campo connectionId
            let configurationApi = copyFactory.configurationApi;

            // obtiene todos las cuentas vinculados al copyFactory
            let masterAccountId = configurationApi.generateAccountId();
        
            await configurationApi.updateAccount(masterAccountId, {
                name: 'Demo account',
                connectionId: masterMetaapiAccount.id,
                subscriptions: []
            }).catch(err => {
                console.log(err)
                return reject('Error inesperado')
            })
    
            return resolve(true)
        } catch (error) {
            console.log(error);
            return reject('Error inesperado')
        }
    })
}

exports.addUserToCopySlave = (email) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            let admins = await User.find({ role: 'Admin' })
                .catch(err =>{
                    console.log(err);
                    return reject('Error inesperado')
                })

            if(!admins) return reject('No hay usuarios maestros')
        
            let user = await User.findOne({ email })
                .catch(err =>{
                    console.log(err)
                    return reject('Error inesperado')
                })

            if(!user) return reject('No se encontró un usuario para añadir a la cuenta maestra')
        
            let configurationApi = copyFactory.configurationApi;
        
            let slaveMetaapiAccount = await api.metatraderAccountApi.getAccount(user.idAccountMTC);

            for (let i = 0; i < admins.length; i++) {
                let masterMetaapiAccount = await api.metatraderAccountApi.getAccount(admins[0].idAccountMTC);
        
                let slaveAccountId = configurationApi.generateAccountId();
                
                // crear una estrategia que se está copiando
                let strategyId = await configurationApi.generateStrategyId();
                
                // actualizar la estrategia conectandola al usuario maestro
                await configurationApi.updateStrategy(strategyId.id, {
                    name: `User Strategy`,
                    description: 'Strategy for to copy',
                    positionLifecycle: 'hedging',
                    connectionId: masterMetaapiAccount.id,
                    maxTradeRisk: 0.1,
                    stopOutRisk: {
                        value: 0.4,
                        startTime: new Date()
                    },
                    timeSettings: {
                        lifetimeInHours: 192,
                        openingIntervalInMinutes: 5
                    }
                });
            
                // suscribir cuentas esclavas de CopyFactory a la estrategia
                await configurationApi.updateAccount(slaveAccountId, {
                    name: 'Demo account',
                    connectionId: slaveMetaapiAccount.id,
                    subscriptions: [
                        {
                            strategyId: strategyId.id,
                            multiplier: 1
                        }
                    ]
                });
            }

            return resolve(true)
        } catch (error) {
            console.log(error);
            return reject('Error inesperado')
        }
    })

}

// Eliminar usuario añadido para el copyTrade
function removeUserToCopySlave (userFound){
    return new Promise( async (resolve, reject) =>{
        try {
            let configurationApi = copyFactory.configurationApi;

            // Remover cuenta
            await configurationApi.removeAccount(userFound._id)
                .catch(err =>{
                    console.log(err);
                    return reject('Error inesperado')
                });

            return resolve('Usuario removido del usuario maestro, Suscripción finalizada')
        } catch (error) {
            console.log(error);
            return reject('Error inesperado')
        }
    })
}

// Eliminar la estrategia añadidia para el copyTrade
exports.removeStrategyToCopy = (email) =>{
    return new Promise( async (resolve, reject) =>{
        try {
            let configurationApi = copyFactory.configurationApi;

            let user = await User.findOne({ email })
                .catch(err => {
                    console.log(err);
                    return reject('Error inesperado')
                });

            // Obtener todas las cuentas de copyTrade
            let accounts = await configurationApi.getAccounts()
                .catch(err =>{
                    console.log(err)
                    return reject('Error inesperado')
                });
            
            // Usuario a eliminar de la estrategia
            let userFound = accounts.find(account => account.connectionId === user.idAccountMTC)

            // Obtener todas las estrategias
            let strategies = await configurationApi.getStrategies()
                .catch(err => {
                    console.log(err)
                    return reject('Error inesperado')
                });

            // Iterar sobre todas las subscripciones del usuairo
            for (let i = 0; i < userFound.subscriptions.length; i++) {
                let strategieFound = strategies.find(strategie => strategie._id === userFound.subscriptions[i].strategyId)
        
                // Remover la estrategia encontrada
                await configurationApi.removeStrategy(strategieFound._id)
            }

            // Llamada a la funcion de eliminar cuenta de copyTrade
            await removeUserToCopySlave(userFound)
                .catch(err =>{
                    console.log(err);
                    return reject('Error inesperado')
                })

            return resolve(true)
        } catch (error) {
            console.log(error);
            return reject('Error inesperado')
        }
    })
}