import React from "react";
import { shallow, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import Map from "../components/finalized/Map";

describe("Testing render of map markers", () => {
    it("renders the number of markers based on the number of events scheduled", () => {
        const onClose = jest.fn();
        const coords = [
            { latitude: 1.3082332, longitude: 103.8858146 },
            { latitude: 1.289825, longitude: 103.855014 },
            { latitude: 1.3082773, longitude: 103.885812 },
        ];
        const map = shallow(<Map onClose={onClose} coords={coords} />);

        expect(map.find("Marker").length).toEqual(3);
    });
});
