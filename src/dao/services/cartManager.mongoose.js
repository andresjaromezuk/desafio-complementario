import fs from 'fs/promises'
import {dbCart} from '../models/cart.mongoose.js'
import { randomUUID } from 'crypto'

class CartManager{
    
    constructor(){}

    //Métodos

    /**
    * Crea un producto
    * @param {Object} a - un producto
    * @throws {Error} - si el code se repite o falta alguna propiedad
    */
     async addProductToCart(cid, pid){

        const cart = await dbCart.findById(cid)
        
        if (!cart){
            throw new Error("El carrito no existe")
        }
        
        //Buscamos el producto en el carrito (se utiliza el find para no hacer otra consulta
        // a la base de datos)
        let {_id, products} = cart
        const product = products.find(item => item.product === pid)
        console.log(pid)
        //Si no existe lo agregamos al array y si existe modificamos cantidad
        
        if (!product) {
            products.push({
                product: pid,
                quantity: 1
            })
        } else {
            const [{product, quantity}] = products
            products ={
                product,
                quantity: quantity +1
            }
            
        }

        const updated_cart= await dbCart.updateOne({_id: _id, }, {$set:{products: products}})

        return updated_cart
     }

    /**
    * Crea un carrito de compras
    * @returns {Object} - Retorna el carrito creado
    */
    async createCart(){
        const pre_cart = {
            _id: randomUUID(),
            products:[]
        }
        const cart = await dbCart.create(pre_cart)
        return cart.toObject()
    }

    /**
     * Retorna un producto según id o lanza error si este no existe
     * @param {number} a - un id
     * @throws {Error} - si no existe el id
     * @returns {Object} - produto encontrado
     */

    async getCartById(id){
        const cart = await dbCart.findById(id).populate('products').lean()
        if (!cart){
            throw new Error("El carrito no existe")
        }
        const {products} = cart
        return products
    }

}

export const cartManager = new CartManager()