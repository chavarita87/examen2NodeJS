import express, {Request, Response} from "express"
import { UnitUser, User } from "./user.interface"
import {StatusCodes} from "http-status-codes"
import * as database from "./user.database"

export const userRouter = express.Router()

/**
 *obtiene todos los usuarios en base
 */
userRouter.get("/users", async (req : Request, res : Response) => {
    try {
        const allUsers : UnitUser[] = await database.findAll()

        if (!allUsers) {
            return res.status(StatusCodes.NOT_FOUND).json({msg : `No hay registros de usuarios..`})
        }

        return res.status(StatusCodes.OK).json({total_user : allUsers.length, allUsers})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

/**
 *obtiene usuario por id
 */
userRouter.get("/user/:id", async (req : Request, res : Response) => {
    try {
        const user : UnitUser = await database.findOne(req.params.id)

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error : `El usuario no encontrado!`})
        }

        return res.status(StatusCodes.OK).json({user})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

/**
 *registra el usuario en base
 */
userRouter.post("/register", async (req : Request, res : Response) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `Favor de ingresar todos los valores requeridos..`})
        }

        const user = await database.findByEmail(email) 

        if (user) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `El email ya se encuentra registrado..`})
        }

        const newUser = await database.create(req.body)

        return res.status(StatusCodes.CREATED).json({newUser})

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

/**
 *Autenticacion de usuario en base por medio de usuario y password
 */
userRouter.post("/login", async (req : Request, res : Response) => {
    try {
        const {email, password} = req.body

        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : "Favor de ingresar todos los valores requeridos.."})
        }

        const user = await database.findByEmail(email)

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error : "Error login!"})
        }

        const comparePassword = await database.comparePassword(email, password)

        if (!comparePassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `Error login!`})
        }

        return res.status(StatusCodes.OK).json({error : `Bienvenido!`})

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

/**
 *actualiza el usuario en base
 */
userRouter.put('/user/:id', async (req : Request, res : Response) => {

    try {

        const {username, email, password} = req.body

        const getUser = await database.findOne(req.params.id)

        if (!username || !email || !password) {
            return res.status(401).json({error : `Favor de ingresar todos los valores requeridos..`})
        }

        if (!getUser) {
            return res.status(404).json({error : `No se encontro el usuario con id ${req.params.id}`})
        }

        const updateUser = await database.update((req.params.id), req.body)

        return res.status(201).json({updateUser})
    } catch (error) {
        console.log(error) 
        return res.status(500).json({error})
    }
})
/**
 *Borra usuario en base
 */
userRouter.delete("/user/:id", async (req : Request, res : Response) => {
    try {
        const id = (req.params.id)

        const user = await database.findOne(id)

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error : `El usuario no existe`})
        }

        await database.remove(id)

        return res.status(StatusCodes.OK).json({msg : "Usuario borrado"})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})