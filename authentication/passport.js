const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const passport = require('passport')
const passportLocal = require('passport-local')
const passportGoogleOauth20 = require('passport-google-oauth2')
const passportFacebook = require('passport-facebook')

const User = require('../models/Users')

const localStrategy = passportLocal.Strategy

const SALTOS_ENCRIPTAR = 10

passport.use('register', 
        new localStrategy (
            {
                usernameField: 'email', //mapeo de campo email
                passwordField: 'password', //mapeo de campo contrasena
                passReqToCallback: true //se asegura de pasar la request que viene por api para poder acceder al req.body
            },
            async ( req, email, password, done ) => {  //funciona como el next es una funcion que se invoca cuando este completado el proceso
                try{
                //1 buscar si el usuario existe en BBDD
                const usuarioExistente = await User.findOne({ email: email })
                
    
                //2 Si el usuario ya existe retornamos error
                if(usuarioExistente) {
                    const error = new Error('Usuario ya registrado')
                    return done(error)
                }
                
                //3 Encriptar la password
                const passwordHashed = await bcrypt.hash(password, SALTOS_ENCRIPTAR)
                                                           
                //4 crear documento del usuario para guardarlo en BBDD
                const nuevoUsuario = new User({
                    email: email,
                    password: passwordHashed,
                    name: req.body.name,
                    lastName: req.body.lastName,
                    user_rol: req.body.user_rol,
                })
    
                //guardamos el nuevo usuario
                const usuarioGuardado = await nuevoUsuario.save()

                //4.1 no devolver contraseña
                usuarioGuardado.password = undefined;
    
                //5 Retornar ok/ko
                //parametros [error, usuarioCreado]
                done( null, usuarioGuardado )
                } catch(err) {
                    return done(err)
                }
    
            }
        )
       
    )

    passport.use('login', 
        new localStrategy (
            {
                usernameField: 'email', //mapeo de campo email
                passwordField: 'password', //mapeo de campo contrasena
                passReqToCallback: true //se asegura de pasar la request que viene por api para poder acceder al req.body
            },
            async ( req, email, password, done ) => {  //funciona como el next es una funcion que se invoca cuando este completado el proceso
                
                try{
                //1 buscar si el usuario existe en BBDD por correo / algo unico que el usuario recuerde
                const usuarioExistente = await User.findOne({ email: email }).populate('user_rol')

                //2 si no existe peta
                if(!usuarioExistente) {
                    const error = new Error(JSON.stringify({ message:'Usuario no registrado', failed:true }))
                    return done(error)
                }
                

                //3 comparar passwords
                const passwordIsValid = await bcrypt.compare(password, usuarioExistente.password)
                
                //4 validar que las contrasenas seen validas, si no son validas petamos
                if(!passwordIsValid) {
                    const error = new Error('Contraseña incorrecta')
                    return done(error)
                }
                
                //5 si existe el correo y la contra es valida dejamos pasar al log
                usuarioExistente.password = undefined

                return done( null, usuarioExistente )

                } catch(err) {

                    return done(err)
                }
    
            }
        )
       
    )

    passport.use('login-social', 
        new localStrategy (
            {
                usernameField: 'email', //mapeo de campo email
                passwordField: 'password', //mapeo de campo contrasena
                passReqToCallback: true //se asegura de pasar la request que viene por api para poder acceder al req.body
            },
            async ( req, email, password, done ) => {
                try{
                    //1 buscar si el usuario existe en BBDD
                    const usuarioExistente = await Usuario.findOne({ email: email })
    
                    //2 Si el usuario no existe petamos, si existe continuamos
                    //comprobar que la contraseña sea la adedcuada
                    if(usuarioExistente) {
                        await bcrypt.compare(password, usuarioExistente.password, function(err, result) {
                            if(result) {
                                return done(null, 'Usuario logueado exitosamente')
                            }
                            const error = new Error('Contraseña incorrecta');
                            return done(error)                            
                        });
                        
                    } else {
                        const error = new Error('Usuario no existe en BBDD')
                        return done(error)
                    }
                }
                catch(err) {
                    return done(err)
                }
            }
        )
    )

    //google strategy
    const GOOGLE_CLIENT_ID = '508187222245-vtfikn79ibnvvfpnanmq9em5filulk7o.apps.googleusercontent.com'
    const GOOGLE_CLIENT_SECRET = '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'
    const GOOGLE_CALLBACK_URI = 'http://localhost:3000/usuarios/google/callback'

    const GoogleStrategy = passportGoogleOauth20.Strategy

    passport.use(
        new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: GOOGLE_CALLBACK_URI,
            passReqToCallback: true
      },
      async ( req,accessToken, refreshToken, profile, done ) => {

        const userExist = await Usuario.find({ email: profile.email });

        //si existe un usauario que ya tiene registrada una cuenta normal 
        if(userExist[0]?.email && !userExist[0]?.googleId) {

            const error = new Error(`Ya existe un usuario con la cuenta que desea ingresar`)
            error.status = 302;
            return done(error)

        } else if(userExist[0]?.email === profile.email) {  
            //si ya se ha logueado con google alguna vez
                return done(null, userExist[0]);

        } else {
            //si no se ha logueado con google crea el usuario y permite acceder
                const googleUser = new Usuario({
                    nombre: profile.given_name, 
                    email:profile.email,
                    password: profile.id,
                    googleId: profile.id 
                })

                googleUser.save()
                .then( user => {
                    return done(null, user)
                })
                .catch( err => {
                    const error = new Error(`cliente no editado ${err}`)
                    error.status = 405;
                    return done(error)
                })


        }

      }
    ));

    //facebook strategy
    const FACEBOOK_APP_ID = '631428528111998'
    const FACEBOOK_APP_SECRET = 'cd9908f3c1302cc64db863bcd9f493e2'
    const FACEBOOK_CALLBACK_URI = 'http://localhost:3000/usuarios/facebook/callback'


    const FacebookStrategy = passportFacebook.Strategy

    passport.use(
        new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: FACEBOOK_CALLBACK_URI,
        profileFields: ['id', 'displayName', 'photos', 'email'],
        passReqToCallback: true
      },
      async (accessToken, refreshToken, elems, profile, done) => {

        const userExist = await Usuario.find({ email:profile.emails[0].value });

        //si existe un usauario que ya tiene registrada una cuenta normal 
        if(userExist[0]?.email && !userExist[0]?.facebookId) {

            const error = new Error(`Ya existe un usuario con la cuenta que desea ingresar`)
            error.status = 302;
            return done(error);

        } else if(userExist[0]?.email === profile.emails[0].value) {  
            //si ya se ha logueado con google alguna vez
                return done(null, userExist[0]);

        } else {
            //si no se ha logueado con google crea el usuario y permite acceder
                const facebookUser = new Usuario({
                    nombre: profile.displayName, 
                    email:profile.emails[0].value,
                    password: profile.id,
                    facebookId: profile.id 
                })

                facebookUser.save()
                .then( user => {
                    return done(null, user)
                })
                .catch( err => {
                    const error = new Error(`cliente no editado ${err}`)
                    error.status = 405;
                    return done(error);
                })


        }

      }
    ));

    passport.serializeUser((user, done) => {
         done(null, user._id);
     });
     
     passport.deserializeUser(async (userId, done) => {
        try {
          const existingUser = await User.findById(userId);
            done(null, existingUser);
        } catch (err) {
          return done(err);
        }
    });