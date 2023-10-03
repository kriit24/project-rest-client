import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import renderer from 'react-test-renderer';

import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);

import address from "./app/model/address";
import object from "./app/model/object";


export default class MainApp extends React.Component {

    constructor() {
        super();
    }

    render() {

        /*
        object.save({
            object_id: 5000,
            object_address_id: 5000,
            object_name: 'five thousant'
        });

        object.delete(5000);

        object
            .where('object_id', 5000)
            .fetch((row) => {

                console.log('OBJECT-5000');
                console.log(JSON.stringify(row, null, 2));
            });


        address
            .where('address_id', 71)
            .fetch((row) => {

                console.log('');
                console.log('ADDRESS-1');
                console.log('---', row);
                console.log('');
            });
        */

        object
            .with('address')
            .limit(2)
            .fetchAll(async (rows) => {

                //console.log('');
                //console.log('OBJECT-1', Object.values(rows).length);
                //console.log('---', JSON.stringify(rows, null, 2));
                //console.log('---object_id---' + rows[0].object_id, rows[0].address);
                //console.log('');
            });

        console.log('render');

        return (
            <View style={styles.container}>
                <Text>header</Text>
                <View>
                    <Text>content</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

test('renders correctly', () => {
    //let tree = Test('see');
    //console.log(tree);
    const tree = renderer.create(<MainApp />).toJSON();
    expect(tree).toMatchSnapshot();
});
