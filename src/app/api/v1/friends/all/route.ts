import { connect } from "@/helpers/connectDB";
import { CustomResponse } from "@/helpers/customResponse";
import { NextRequest } from "next/server";
import { friendModel } from "@/models/friend.model";
import { fetchUser } from "@/helpers/fetchUser";
import mongoose from "mongoose";

connect()

export async function GET(req: NextRequest) {
    try {

        const user = await fetchUser(req.cookies.get("accessToken")?.value!)
        const friends = await friendModel.aggregate([
            {
              '$match': {
                '$expr': {
                  '$or': [
                    {
                      '$eq': [
                        '$sender', new mongoose.Types.ObjectId(user._id)
                      ]
                    }, {
                      '$eq': [
                        '$acceptor', new mongoose.Types.ObjectId(user._id)
                      ]
                    }
                  ]
                }
              }
            }, {
              '$match': {
                'accepted': true
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'let': {
                  'sender': '$sender', 
                  'acceptor': '$acceptor'
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
                                  '$_id', '$$sender'
                                ]
                              }, {
                                '$eq': [
                                  new mongoose.Types.ObjectId(user._id), '$$acceptor'
                                ]
                              }
                            ]
                          }, {
                            '$and': [
                              {
                                '$eq': [
                                  '$_id', '$$acceptor'
                                ]
                              }, {
                                '$eq': [
                                  new mongoose.Types.ObjectId(user._id), '$$sender'
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    }
                  }, {
                    '$project': {
                      'name': 1, 
                      'profile_pic': 1
                    }
                  }
                ], 
                'as': 'user'
              }
            }, {
              '$addFields': {
                'user': {
                  '$first': '$user'
                }
              }
            }
          ])

        return CustomResponse(200, {friends}, "Fetched")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, { error: err.message }, "Server Error")
    }
}