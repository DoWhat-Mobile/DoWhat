import React from "react";
import sinon from "sinon";
import { shallow, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { filterHelper } from "../reusable-functions/DataTimeline";
import { data_timeline } from "../reusable-functions/DataTimeline";
import { genreEventObjectArray } from "../reusable-functions/DataTimeline";
import { events } from "../MockEvents";
import Finalized from "../components/finalized/Finalized";

configure({ adapter: new Adapter() });

// describe("Testing food filter with restaurant filter", () => {
//     test("should return an object of restaurant key and value of event object related to fiters", () => {
//         const filters = {
//             area: ["North"],
//             cuisine: ["Western"],
//             price: 4,
//         };
//         const result = filterHelper(filters, events);
//         expect(result).toStrictEqual({
//             restaurants: {
//                 cuisine: "Western, Arab",
//                 price_level: 4,
//                 tags: ["North"],
//             },
//         });
//     });
// });
// describe("Testing food filter with hawker filter", () => {
//     test("should return an object of hawker key and event that does not need to match the filters from price", () => {
//         const filters = {
//             area: ["North"],
//             cuisine: ["Hawker"],
//             price: 3,
//         };
//         const result = filterHelper(filters, events);
//         expect(result).toStrictEqual({
//             hawker: {
//                 price_level: 1,
//                 tags: ["North"],
//             },
//         });
//     });
// });
// describe("Testing food filter with cafe filter", () => {
//     test("should return a cafe event as long as the cuisine filter contains Cafe", () => {
//         const filters = {
//             area: ["East"],
//             cuisine: ["Cafe", "Western", "Japanese"],
//             price: 2,
//         };
//         const result = filterHelper(filters, events);
//         expect(result).toStrictEqual({
//             cafes: {
//                 price_level: 2,
//                 tags: ["East"],
//             },
//         });
//     });
// });
// describe("Testing food filter with price that is smaller than all database items", () => {
//     test("should return an event related to the genre", () => {
//         const filters = {
//             area: ["East"],
//             cuisine: ["Korean"],
//             price: 1,
//         };
//         const result = filterHelper(filters, events);
//         expect(result).toStrictEqual({
//             restaurants: {
//                 cuisine: "Western, Arab",
//                 price_level: 4,
//                 tags: ["North"],
//             },
//         });
//     });
// });
// describe("Testing food filter with price that is larger than all database items", () => {
//     test("should return an event related to the genre", () => {
//         const filters = {
//             area: ["West"],
//             cuisine: ["Korean"],
//             price: 4,
//         };
//         const result = filterHelper(filters, events);
//         expect(result).toStrictEqual({
//             restaurants: {
//                 cuisine: "Korean",
//                 price_level: 3,
//                 tags: ["West"],
//             },
//         });
//     });
// });
/*********************************************************
 * first integration with genreEventObjectArray function *
 ********************************************************/

// const mockMath = Object.create(global.Math);
// mockMath.random = () => 0;
// global.Math = mockMath;

// test("should show filterHelper works as expected in integration test", () => {
//     const filters = {
//         area: ["North"],
//         cuisine: ["Hawker"],
//         price: 3,
//     };
//     const userGenres = ["food"]; //include nature
//     const result = genreEventObjectArray(userGenres, events, filters);
//     expect(result).toStrictEqual([
//         {
//             hawker: {
//                 name: "Marsiling",
//                 description: "MeeKia",
//                 price_level: 1,
//                 tags: ["North"],
//                 coord: {
//                     latitude: 1.3082332,
//                     longitude: 103.8858146,
//                 },
//             }
//         },
//     ]);
// });

// test("should show push other objects with non-food genres into array", () => {
//     const userGenres = ["adventure", "nature"];
//     const result = genreEventObjectArray(userGenres, events, {});
//     expect(result).toStrictEqual([
//         {
//             adventure:{
//                 name: "Sentosa",
//                 description: "Far",
//                 coord: {
//                     latitude: 1.289825,
//                     longitude: 103.855014,
//                 },
//             },
//         },
//         {
//             nature : {
//                 name: "Tree",
//                 description: "Green",
//                 coord: {
//                     latitude: 1.3082773,
//                     longitude: 103.885812,
//                 },
//             }
//         },
//     ]);
// });

// test("should show push objects from any genres into array", () => {
//     const filters = {
//         area: ["North"],
//         cuisine: ["Hawker"],
//         price: 3,
//     };
//     const userGenres = ["food", "adventure", "nature"];
//     const result = genreEventObjectArray(userGenres, events, filters);
//     expect(result).toStrictEqual([
//         {
//             hawker:{
//                 name: "Marsiling",
//                 description: "MeeKia",
//                 price_level: 1,
//                 tags: ["North"],
//                 coord: {
//                     latitude: 1.3082332,
//                     longitude: 103.8858146,
//                 },
//             },
//         },
//         {
//             adventure:  {
//                 name: "Sentosa",
//                 description: "Far",
//                 coord: {
//                     latitude: 1.289825,
//                     longitude: 103.855014,
//                 },
//             }
//         },
//         {
//             nature: {
//                 name: "Tree",
//                 description: "Green",
//                 coord: {
//                     latitude: 1.3082773,
//                     longitude: 103.885812,
//                 },
//             }
//         },
//     ]);
// });

/***************************************************************
 * Integration for final scheduling algo. Test using number of *
 * items in location array and timeline end
 *
 * location array length should be expected
 * Maybe can test timeslots whether correctly                *
 ***************************************************************/
test("timing, data and location array should all have length equal to number of events scheduled", () => {
    const filters = {
        area: ["North"],
        cuisine: ["Hawker"],
        price: 3,
    };
    const userGenres = ["food", "adventure", "nature"];
    const timeline = [12, 20];
    const result = data_timeline(timeline, userGenres, events, filters);
    const timingsArray = result[1];
    const locationsArray = result[2];
    const dataLength = result[0].length;
    expect(timingsArray.length).toBe(dataLength);
    expect(locationsArray.length).toBe(dataLength);
});

test("last event never exceeds time interval", () => {
    const filters = {
        area: ["North"],
        cuisine: ["Hawker"],
        price: 3,
    };
    const userGenres = ["adventure", "nature"];
    const timeline = [10, 20];
    const result = data_timeline(timeline, userGenres, events, filters);
    const timingsArray = result[1];
    const lastTiming = timingsArray.pop();
    const lastEnd = parseInt(lastTiming.end.substring(0, 2));
    console.log(lastEnd);
    console.log(timingsArray.length);
    expect(lastEnd).toBeLessThan(timeline[1]);
});
