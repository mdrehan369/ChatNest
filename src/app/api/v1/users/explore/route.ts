import { userModel } from "@/models/user.model"
import { CustomResponse } from "@/helpers/customResponse"
import { connect } from "@/helpers/connectDB"
import { NextRequest } from "next/server"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

connect()

export async function GET(req: NextRequest) {
  try {

    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 10
    const search = req.nextUrl.searchParams.get("search")

    const token = req.cookies.get("accessToken")?.value
    const decodedToken: any = jwt.verify(token!, process.env.JWT_SECRET_KEY!)

    // const users = await userModel.find({}).skip(page*limit).limit(limit)
    const users = await userModel.aggregate([
      {
        '$match': {
          '$or': [
            {
              'name': {
                '$regex': search, '$options': 'i'
              }
            },
            {
              'username': {
                '$regex': search, '$options': 'i'
              }
            }
          ]
        }
      },
      {
        '$match': {
          '$expr': {
            '$not': {
              '$eq': [
                '$_id', new mongoose.Types.ObjectId(decodedToken.id)
              ]
            }
          }
        }
      }, {
        '$lookup': {
          'from': 'friends',
          'let': {
            'user': new mongoose.Types.ObjectId(decodedToken.id),
            'otherUser': '$_id'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$or': [
                    {
                      '$and': [
                        {
                          '$eq': [
                            '$sender', '$$user'
                          ]
                        }, {
                          '$eq': [
                            '$acceptor', '$$otherUser'
                          ]
                        }
                      ]
                    }, {
                      '$and': [
                        {
                          '$eq': [
                            '$acceptor', '$$user'
                          ]
                        }, {
                          '$eq': [
                            '$sender', '$$otherUser'
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          'as': 'friends'
        }
      }, {
        '$addFields': {
          'friend': {
            '$cond': [
              {
                '$eq': [
                  {
                    '$size': '$friends'
                  }, 1
                ]
              }, {
                '$first': '$friends'
              }, null
            ]
          }
        }
      }, {
        '$project': {
          'username': 1,
          'name': 1,
          'profile_pic': 1,
          'friend': 1
        }
      }
    ]).skip((page - 1) * limit).limit(limit)

    return CustomResponse(200, { "users": users }, "Fetched")

  } catch (err: any) {
    console.log(err)
    return CustomResponse(500, { "error": err.message }, "Server Error")
  }
}