import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prismaClient = new PrismaClient();

function generateRandomPassword(length: number = 32): string {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    let password = "";
    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}

const createUser = async (req: Request, res: Response) => {
    try {
        const userDTO = req.body;
    
        // Juat check we have all of the parameters for now
        const userDTOIsValid =
            userDTO.email &&
            userDTO.username &&
            userDTO.firstName &&
            userDTO.lastName;
        
        if (!userDTOIsValid) {
            return res.status(400).json({
                error: 'ValidationError',
                data: undefined,
                success: false
            });
        }

        // check if user with username already exists
        const usernameAlreadyTaken = await prismaClient.user.findFirst({
            where: {
                username: userDTO.username
            }
        });

        if (usernameAlreadyTaken) {
            return res.status(409).json({
                error: 'UsernameAlreadyTaken',
                data: undefined,
                success: false
            });
        }
    
    
        // check if user with email already exists
        const emailAlreadyTaken = await prismaClient.user.findFirst({
            where: {
                email: userDTO.email
            }
        });

        if (emailAlreadyTaken) {
            return res.status(409).json({
                error: 'EmailAlreadyInUse',
                data: undefined,
                success: false
            });
        }
    
        userDTO.password = generateRandomPassword();

        const user = await prismaClient.user.create({ data: userDTO });
        return res.status(201).json({
            error: undefined,
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            error: "ServerError",
            data: undefined,
            success: false
        });
    }


}

const editUser = async (req: Request, res: Response) => {  
    try {
        const userId = +req.params.userId;
        const userDTO = req.body;
        
        // Juat check we have all of the parameters for now
        const userDTOIsValid =
            userDTO.email &&
            userDTO.username &&
            userDTO.firstName &&
            userDTO.lastName;
        
        if (!userDTOIsValid) {
            return res.status(400).json({
                error: 'ValidationError',
                data: undefined,
                success: false
            });
        }

        const user = await prismaClient.user.findFirst({
            where: {
                email: userDTO.email
            }
        });

        if (!user) {
            return res.status(404).json({
                error: "UserNotFound",
                data: undefined,
                success: false
            });
        }

        // check if user with username already exists
        const userWithUsernameAlreadyExists = await prismaClient.user.findFirst({
            where: {
                username: userDTO.username,
                NOT: {
                    id: userId
                }
            }
        });

        if (userWithUsernameAlreadyExists) {
            return res.status(409).json({
                error: 'UsernameAlreadyTaken',
                data: undefined,
                success: false
            });
        }
    
        const userWithEmailAlreadyExists = await prismaClient.user.findFirst({
            where: {
                email: userDTO.email,
                NOT: {
                    id: userId
                }
            }
        });

        if (userWithEmailAlreadyExists) {
            return res.status(409).json({
                error: 'EmailAlreadyInUse',
                data: undefined,
                success: false
            });
        }

        const updatedUser = await prismaClient.user.update({
            where: {
                id: userId
            },
            data: {
                email: userDTO.email,
                username: userDTO.username,
                firstName: userDTO.firstName,
                lastName: userDTO.lastName
            }
        });

        return res.status(200).json({
            error: undefined,
            data: {
                id: updatedUser.id,
                email: updatedUser.email,
                username: updatedUser.username,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
            },
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            error: "ServerError",
            data: undefined,
            success: false
        });
    }
}

const getUserByEmail = async (req: Request, res: Response) => {
    const email = req.query?.email as string;

    try {
        const user = await prismaClient.user.findFirst({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(404).json({
                error: "UserNotFound",
                data: undefined,
                success: false
            });
        }

        return res.json({
            error: undefined,
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            error: "ServerError",
            data: undefined,
            success: false
        });
    }
}

export {
    createUser,
    editUser,
    getUserByEmail
}
