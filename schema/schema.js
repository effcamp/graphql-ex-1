const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = require('graphql');
const axios = require('axios');

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parentValue, args) {
        const users = await axios.get(
          `http://localhost:3000/companies/${parentValue.id}/users`
        );
        return users.data;
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      async resolve(parentValue, args) {
        // console.log(parentValue, args);
        const company = await axios.get(
          `http://localhost:3000/companies/${parentValue.companyId}`
        );
        return company.data;
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const user = await axios.get(`http://localhost:3000/users/${args.id}`);
        // console.log(user.data);
        return user.data;
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const company = await axios.get(
          `http://localhost:3000/companies/${args.id}`
        );
        return company.data;
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      async resolve(parentValue, { firstName, age }) {
        const user = await axios.post('http://localhost:3000/users', {
          firstName,
          age
        });
        return user.data;
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parentValue, { id }) {
        const user = await axios.delete(`http://localhost:3000/users/${id}`);
        return user.data;
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      async resolve(parentValue, { id, firstName, age, companyId }) {
        const user = await axios.patch(`http://localhost:3000/users/${id}`, {
          firstName,
          age,
          companyId
        });
        return user.data;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});
