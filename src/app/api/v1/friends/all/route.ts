import { connect } from "@/helpers/connectDB"
import { CustomResponse } from "@/helpers/customResponse"
import { NextRequest } from "next/server"
import { fetchUser } from "@/helpers/fetchUser"
import mongoose from "mongoose"
import { userModel } from "@/models/user.model"

connect()

export async function GET(req: NextRequest) {
    try {

        const user = await fetchUser(req.cookies.get("accessToken")?.value!)
        const search = req.nextUrl.searchParams.get("search") || ""
        const friends = await userModel.aggregate([
          {
            '$match': {
              '$expr': {
                '$not': {
                  '$eq': [
                    '$_id', new mongoose.Types.ObjectId(user._id)
                  ]
                }
              }
            }
          }, {
            '$lookup': {
              'from': 'friends', 
              'let': {
                'user': new mongoose.Types.ObjectId(user._id), 
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
            '$lookup': {
              'from': 'chats', 
              'let': {
                'sender': '$friend.sender', 
                'acceptor': '$friend.acceptor'
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
                                '$from', '$$sender'
                              ]
                            }, {
                              '$eq': [
                                '$to', '$$acceptor'
                              ]
                            }
                          ]
                        }, {
                          '$and': [
                            {
                              '$eq': [
                                '$to', '$$sender'
                              ]
                            }, {
                              '$eq': [
                                '$from', '$$acceptor'
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              ], 
              'as': 'chats'
            }
          }, {
            '$addFields': {
              'lastChat': {
                '$last': '$chats'
              }
            }
          }, {
            '$match': {
              '$and': [
                {
                  'friend': {
                    '$ne': null
                  }
                }, {
                  'friend.accepted': {
                    '$ne': false
                  }
                }
              ]
            }
          }, {
            '$match': {
              'name': {
                '$regex': new RegExp(search), 
                '$options': 'i'
              }
            }
          }, {
            '$project': {
              'username': 1, 
              'name': 1, 
              'profile_pic': 1, 
              'friend': 1, 
              'lastChat': 1,
              'isOnline': 1
            }
          }
        ])

        return CustomResponse(200, {friends}, "Fetched")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, { error: err.message }, "Server Error")
    }
}