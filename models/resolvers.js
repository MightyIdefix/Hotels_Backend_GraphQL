import User from './models/userQL';
import Hotel from './models/hotelsQL';

export const Userresolvers = {
    Query: {
        async userLogin() {
            return await User.find();
        }
    },
    Mutation: {
        async userRegister() {
            return await User.create();
        }
    },
    Mutation: {
        async changeRole() {
            return await User.find();
        }
    }
};

export const Hotelresolvers = {
    Mutation: {
        async addHotel() {
            return await Hotel.create(input);
        }
    },
    Mutation: {
        async addRoom() {
            return await Hotel.create(input);
        }
    },
    Query: {
        async getRoom() {
            return await User.find();
        }
    }
};

module.export