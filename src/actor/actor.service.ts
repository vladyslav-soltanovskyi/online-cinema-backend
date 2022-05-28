import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { ActorModel } from './actor.model';
import { ActorDto } from './dto/actor.dto';

@Injectable()
export class ActorService {
    constructor(
        @InjectModel(ActorModel) private readonly actorModel: ModelType<ActorModel>
    ) {}

    async bySlug(slug: string) {
        const doc = await this.actorModel.findOne({ slug }).exec();
        if(!doc) {
            throw new NotFoundException("Actor not found");
        }
        return doc;
    }

    async getAll(searchTerm?: string) {
        let options = {};

        if(searchTerm) {
            options = {
                $or: [
                    {
                        email: new RegExp(searchTerm, 'i')
                    },
                    {
                        glug: new RegExp(searchTerm, 'i')
                    }
                ]
            }
        }

        return this.actorModel
            .aggregate()
            .match(options)
            .lookup({
                from: "Movie",
                localField: "_id",
                foreignField: "actors",
                as: "movies"
            })
            .addFields({
                countMovies: {
                    $size: "$movies"
                }
            })
            .project({
                __v: 0,
                updatedAt: 0,
                movies: 0
            })
            .sort({
                createdAt: -1
            })
            .exec();
    }

    /* Admin place */

    async byId(_id: string) {
        const actor = await this.actorModel.findById(_id);
        if(!actor) {
            throw new NotFoundException("Actor not found");
        }

        return actor;
    }

    async create() {
        const defalutValue: ActorDto = {
            photo: '',
            slug: '',
            name: ''
        }
        const actor = await this.actorModel.create(defalutValue);
        return actor._id;
    }

    async update(_id: string, dto: ActorDto) {
        const updatedDoc = await this.actorModel.findByIdAndUpdate(_id, dto, {
            new: true
        }).exec();

        if(!updatedDoc) {
            throw new NotFoundException("Actor not found");
        }

        return updatedDoc;
    }

    async delete(id: string) {
        const deleteDoc = await this.actorModel.findByIdAndDelete(id).exec();;

        if(!deleteDoc) {
            throw new NotFoundException("Actor not found");
        }

        return deleteDoc;
    }
}
