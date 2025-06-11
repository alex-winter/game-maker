import {
    Request as ExpressRequest,
    Response as ExpressResponse,
    RequestHandler as ExpressRequestHandler
} from 'express'

export type Request<
    Params = Record<string, any>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = Record<string, any>
> = ExpressRequest<Params, ResBody, ReqBody, ReqQuery>

export type Response<T = any> = ExpressResponse<T>

export type RequestHandler<
    Params = Record<string, any>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = Record<string, any>
> = ExpressRequestHandler<Params, ResBody, ReqBody, ReqQuery>