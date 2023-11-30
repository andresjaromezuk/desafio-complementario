import fs from 'fs/promises'
import {dbProduct} from '../models/product.mongoose.js'
import __dirname from '../../util.js'
import path from 'path'
import { randomUUID } from 'crypto'

class ProductManager{

    constructor(){}

    //Métodos

    /**
     * Devuelve los productos existentes
     * @returns {Array} - arreglo de productos
     */
    async getProducts(limit){
        const products = await dbProduct.find().limit(limit).lean()
        return products
    }

    async addImageToProduct(code,filename){ 
        const product = await dbProduct.updateOne({code: code}, {$set: {thumbnail: [`http://localhost:8080/static/images/${filename}`]}})
        return product  
    }

    /**
    * Crea un producto
    * @param {Object} a - un producto
    * @throws {Error} - si el code se repite o falta alguna propiedad
    */
    async addProduct(datosProducto){
        datosProducto._id = randomUUID()
        const product = await dbProduct.create(datosProducto)
        return product.toObject()
    }

    /**
     * Retorna un producto según id o lanza error si este no existe
     * @param {number} a - un id
     * @throws {Error} - si no existe el id
     * @returns {Object} - produto encontrado
     */
    async getProductById(id){
        const product = dbProduct.findById(id).lean()
        if (!product){
            throw new Error("El producto no existe")
        }
        return product
    }

     /**
     * Actualiza un producto
     * @param {number} a - un id
     * @param {Object} a - Atributos de un producto
     * @throws {Error} - si no existe el producto o los atributos están incompletos
     * @returns {Object} - poducto actualizado
     */
    async updateProduct(pid, body){   
        const product = dbProduct.findByIdAndUpdate(pid, body)
        return product
    }

    /**
     * Actualiza un producto
     * @param {number} a - un id
     * @throws {Error} - si no existe el producto
     * @returns {Object} - poducto actualizado
     */
    async deleteProduct(id){

        const product = await dbProduct.findByIdAndDelete(id)

        console.log(product)
        
        if (product.thumbnail.length > 0){
            const filename = product.thumbnail[0].split("images/")[1]
            console.log(filename)
            const filePath = path.join(__dirname, `../static/images/${filename}`)
            console.log(filePath)
            await fs.unlink(filePath)
        }

        return product
    }

}

export const productManager = new ProductManager()
