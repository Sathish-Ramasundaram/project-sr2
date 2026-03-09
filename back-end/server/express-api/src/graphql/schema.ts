import { createSchema } from 'graphql-yoga';
import { getTrackedOrderForCustomer } from '../modules/orderTracking/orderTrackingService';

export const graphqlSchema = createSchema({
  typeDefs: /* GraphQL */ `
    type TrackOrderItem {
      productId: ID!
      productName: String!
      quantity: Int!
      unitPrice: Float!
      lineTotal: Float!
      unit: String!
    }

    type TrackOrderOrder {
      orderId: ID!
      placedAt: String!
      orderStatus: String!
      totalAmount: Float!
      items: [TrackOrderItem!]!
    }

    type TrackOrderResult {
      status: String!
      estimatedTime: String!
      order: TrackOrderOrder!
    }

    type Query {
      trackOrder(orderId: ID!): TrackOrderResult!
    }
  `,
  resolvers: {
    Query: {
      trackOrder: async (
        _parent,
        args: { orderId: string },
        context: { request: Request }
      ) => {
        const authHeader = context.request.headers.get('authorization');
        return getTrackedOrderForCustomer(args.orderId, authHeader);
      },
    },
  },
});
