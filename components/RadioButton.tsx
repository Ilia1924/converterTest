import React from 'react';
import { View } from 'react-native';
import { RadioButton } from 'react-native-paper';

type MyRadioButtonType = {
    selected: boolean,
    onSelect: () => void
}
const MyRadioButton = ({ selected, onSelect }: MyRadioButtonType) => {
    return (
        <View>
            <RadioButton
                value="selected"
                status={selected ? 'checked' : 'unchecked'}
                onPress={onSelect}
            />
        </View>
    );
};

export default MyRadioButton;