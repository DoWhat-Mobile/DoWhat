import React from "react";
import sinon from "sinon";
import { shallow, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import AreaSelection from "../components/genre/AreaSelection";
import CuisineSelection from "../components/genre/CuisineSelection";

configure({ adapter: new Adapter() });

describe("Testing render buttons function", () => {
    it("number of buttons rendered correspond to length of array passed in", () => {
        const HandleAreaPressSpy = sinon.spy();
        const HandleCuisinePressSpy = sinon.spy();
        const renderAreaButtons = shallow(
            <AreaSelection handleAreaPress={HandleAreaPressSpy} />
        );

        const renderCuisineButtons = shallow(
            <CuisineSelection handleCuisinePress={HandleCuisinePressSpy} />
        );
        expect(renderAreaButtons.find("TouchableOpacity").length).toEqual(4);
        expect(renderCuisineButtons.find("TouchableOpacity").length).toEqual(8);
        // render.instance().handlePress("North");
        // expect(toJson(onHandleAreaPressSpy.args)).toMatchSnapshot();
    });
});

describe("Testing onPress function of buttons", () => {
    it("handlePress function works when user toggles button to add/remove selected button to array", () => {
        const HandleAreaPressSpy = sinon.spy();
        const AreaButtons = shallow(
            <AreaSelection handleAreaPress={HandleAreaPressSpy} />
        );
        AreaButtons.find("TouchableOpacity").last().simulate("press");
        expect(
            AreaButtons.find("TouchableOpacity").last().props()["style"][1][
                "backgroundColor"
            ]
        ).toEqual("silver");
    });
});

// test('button press will add area into array if not inside', () => {
//     const {getByType} = render(<AreaSelection )
// })
