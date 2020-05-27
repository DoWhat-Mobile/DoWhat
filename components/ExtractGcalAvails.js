import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { connect } from 'react-redux';

class ExtractGcalAvails extends Component {
    url = 'https://www.googleapis.com/calendar/v3/freeBusy?alt=json&prettyPrint=true&key=[AIzaSyB3DcUhK37rpYdmO2C8_tKoM8-ugnlInaQ]';

    data = JSON.stringify({
        'timeMin': '2020-04-28T08:00:00+08:00',
        'timeMax': '2020-04-28T20:00:00+08:00',
        'timeZone': 'UTC+08:00',
        'items': [
            {
                'id': 'hansybastian@gmail.com'
            }
        ]
    })


    fetchData = {
        method: 'POST',
        body: this.data,
        headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application.json',
            //Authorization: 'Bearer [eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyMmM1NDk4YTcwYjc0MjQ5NzI2ZDhmYjYxODlkZWI3NGMzNWM4MGEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSGFucyBTZWJhc3RpYW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2lISFhJMGk1THdnT2pYVjlZNDNzSDJ4N2tQUVdVcVlhWlRwMTVQSWNNPXM5Ni1jIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2Rvd2hhdC0yNzgyMTMiLCJhdWQiOiJkb3doYXQtMjc4MjEzIiwiYXV0aF90aW1lIjoxNTkwNTAzMzIzLCJ1c2VyX2lkIjoiTm1CM1FSeGhuTFRNbVF6UzF5QTZMSklqb0pmMSIsInN1YiI6Ik5tQjNRUnhobkxUTW1RelMxeUE2TEpJam9KZjEiLCJpYXQiOjE1OTA1MDMzMjMsImV4cCI6MTU5MDUwNjkyMywiZW1haWwiOiJoYW5zeWJhc3RpYW5AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMDAwNjM5NzY5NDg1Njg4MTgyNTAiXSwiZW1haWwiOlsiaGFuc3liYXN0aWFuQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.oJKhdS6ev4YN1RELYWt51jDYRudHoZwuvJwbIiiW3nyPMXRGoG7D9oocY6ogAyJBgDvfT_CxDSCBX6gskld3QhmMYVaxFxPqnv7tNPm65HEcmz94lbnmk_RgUfsuhDsfYqSONQV1HtV4KNanO7actdYoncahS90GLN7vNGU2_R56amhq0wq0jz-oevb6kkcKX4VeGljvCKwtgJO3Fq89Q2VTuWML4ichba8wyRY3amwsdD__3opn_en6ielFiRq38V8hBtJLmeQfkct4Tj6xrCDiD_TGfs-fkW6P08i6c317uDhqZUh3UvY51F6KfK5ld8AA1ZLAq8P6jMNFWKflLA]'
        })
    }
    //url = 'http://dummy.restapiexample.com/api/v1/employees';

    //fetchData = {
    //    method: 'GET',
    //    headers: new Headers({
    //        Accept: 'application/json'
    //    })
    //}

    getAvailableTimings = async () => {
        try {
            fetch(this.url, this.fetchData)
                .then((resp) => resp.json())
                .then((data) => console.log(data))

        } catch (e) {
            console.log(e);
        }
    }

    getGcalAuthorization = () => {
        try {
            https://www.googleapis.com/auth/calendar
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        //this.getAvailableTimings();
    }

    render() {
        return (
            <View style={style.container}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
}



const mapStateToProps = (state) => {
    return {
        access_token: state.access_token,
    }
}

export default connect(mapStateToProps)(ExtractGcalAvails);

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    }
})