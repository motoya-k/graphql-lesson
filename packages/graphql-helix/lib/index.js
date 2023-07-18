"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const graphql_helix_1 = require("graphql-helix");
const schema_1 = require("./schema");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/graphql", async (req, res) => {
    const request = {
        body: req.body,
        headers: req.headers,
        method: req.method,
        query: req.query,
    };
    if ((0, graphql_helix_1.shouldRenderGraphiQL)(request)) {
        res.send((0, graphql_helix_1.renderGraphiQL)());
    }
    else {
        const { operationName, query, variables } = (0, graphql_helix_1.getGraphQLParameters)(request);
        const result = await (0, graphql_helix_1.processRequest)({
            operationName,
            query,
            variables,
            request,
            schema: schema_1.schema,
        });
        (0, graphql_helix_1.sendResult)(result, res);
    }
});
const port = process.env.PORT || 4003;
app.listen(port, () => {
    console.log(`GraphQL server is running on port ${port}.`);
});
//# sourceMappingURL=index.js.map