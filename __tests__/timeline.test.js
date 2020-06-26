import React from "react";
import sinon from "sinon";
import { shallow, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { filterHelper } from "../reusable-functions/data_timeline";
import { genreEventObjectArray } from "../reusable-functions/data_timeline";

configure({ adapter: new Adapter() });
const events = {
    hawker: {
        list: [
            {
                price_level: 1,
                tags: ["Central", "Chinese"],
            },
            {
                price_level: 1,
                tags: ["North"],
            },
        ],
    },
    restaurants: {
        list: [
            {
                cuisine: "Western, Arab",
                price_level: 4,
                tags: ["North"],
            },
            {
                cuisine: "Asian, Japanese",
                price_level: 2,
                tags: ["Central", "East"],
            },
            {
                cuisine: "Korean",
                price_level: 3,
                tags: ["West"],
            },
        ],
    },
    cafes: {
        list: [
            {
                price_level: 2,
                tags: ["East"],
            },
            {
                price_level: 2,
                tags: ["Central"],
            },
        ],
    },
};
describe("Testing food filter with restaurant filter", () => {
    test("should return an object of restaurant key and value of event object related to fiters", () => {
        const filters = {
            area: ["North"],
            cuisine: ["Western"],
            price: 4,
        };
        const result = filterHelper(filters, events);
        expect(result).toStrictEqual({
            restaurants: {
                cuisine: "Western, Arab",
                price_level: 4,
                tags: ["North"],
            },
        });
    });
});
describe("Testing food filter with hawker filter", () => {
    test("should return an object of hawker key and event that does not need to match the filters from price", () => {
        const filters = {
            area: ["North"],
            cuisine: ["Hawker"],
            price: 3,
        };
        const result = filterHelper(filters, events);
        expect(result).toStrictEqual({
            hawker: {
                price_level: 1,
                tags: ["North"],
            },
        });
    });
});
describe("Testing food filter with cafe filter", () => {
    test("should return a cafe event as long as the cuisine filter contains Cafe", () => {
        const filters = {
            area: ["East"],
            cuisine: ["Cafe", "Western", "Japanese"],
            price: 2,
        };
        const result = filterHelper(filters, events);
        expect(result).toStrictEqual({
            cafes: {
                price_level: 2,
                tags: ["East"],
            },
        });
    });
});
describe("Testing food filter with price that is smaller than all database items", () => {
    test("should return an event related to the genre", () => {
        const filters = {
            area: ["East"],
            cuisine: ["Korean"],
            price: 1,
        };
        const result = filterHelper(filters, events);
        expect(result).toStrictEqual({
            restaurants: {
                cuisine: "Western, Arab",
                price_level: 4,
                tags: ["North"],
            },
        });
    });
});
describe("Testing food filter with price that is larger than all database items", () => {
    test("should return an event related to the genre", () => {
        const filters = {
            area: ["West"],
            cuisine: ["Korean"],
            price: 4,
        };
        const result = filterHelper(filters, events);
        expect(result).toStrictEqual({
            restaurants: {
                cuisine: "Korean",
                price_level: 3,
                tags: ["West"],
            },
        });
    });
});
