import { Router } from 'express'
import multerMiddleware from '../middleware/multer.js'
const upload = multerMiddleware('images', 'product')
import {productManager} from '../dao/services/productManager.mongoose.js'
import {dbChat} from '../dao/models/chat.mongoose.js'
import { randomUUID } from 'crypto'

export const webRouter = Router()

webRouter.post('/uploads', upload.single('image'), async (req, res) =>{
   try {
        const {code} = req.body 
        const {filename} = req.file
        const product = await productManager.addImageToProduct(code, filename)
        return res.status(200).json({status: "Success", payload: product})
   } catch (error) {
        res.status(500).json({status: "Error", error: error.message})
   }
})

webRouter.get('/chat', async (req, res) =>{
     try {
       const ioServer = req.io
       
       ioServer.on('connection', async (socket)=>{
          let messages = await dbChat.find().lean()
          console.log("Cliente conectado")
          socket.emit('mensajes', messages)

          socket.broadcast.emit('nuevoUsuario',
               socket.handshake.auth.username
          )

          socket.on('mensaje', async message =>{
               console.log("llega esto", message)
               message._id = randomUUID()
               const msg = await dbChat.create(message)
               messages = await dbChat.find().lean()
               ioServer.sockets.emit('mensajes',messages)
          })

          socket.on('disconnecting', reason => {
               socket.broadcast.emit('usuarioDesconectado',
                 socket.handshake.auth.username)
          })
       })
       return res.render('chat', {title:"Chat"})
     } catch (error) {
          res.status(500).json({status: "Error", error: error.message})
     }
  })

