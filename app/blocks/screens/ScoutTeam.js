// Library imports
import * as React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Component imports
import { fU, vh, vw } from '../../common/Constants';
import { globalButtonStyles, globalInputStyles, globalTextStyles, globalContainerStyles } from '../../common/GlobalStyleSheet';
import { TTButton, TTCheckbox, TTPushButton, TTSimpleCheckbox } from '../components/ButtonComponents';
import { TTCounterInput, TTDropdown, TTNumberInput, TTTextInput } from '../components/InputComponents';
import { serializeData, deserializeData, compressData, decompressData, saveMatchData, loadMatchData } from '../../common/LocalStorage'
import { TTGradient } from '../components/ExtraComponents';
import { ColorScheme as CS } from '../../common/ColorScheme';

const matchTypeValues = ["Practice", "Qualifiers", "Finals"];
const teamColorValues = ["Red", "Blue"]

// Main function
const ScoutTeam = ({route, navigation}) => {
    // Might be good to make some of these into arrays
    
    const [teamNumber, setTeamNumber] = React.useState("");
    const [matchNumber, setMatchNumber] = React.useState("");
    const [matchType, setMatchType] = React.useState("Match Type");
    const [teamColor, setTeamColor] = React.useState("Team Color");

    const [taxi, setTaxi] = React.useState(false);
    const [autoPoints, setAutoPoints] = React.useState({
        speaker: "0", speakerMisses: "0", 
        amp: "0", ampMisses: "0", 
    });
    const setAutoPointParam = (parameter, value) => {
        const temp = {...autoPoints};
        temp[parameter] = value;
        setAutoPoints(temp);
    }

    const [telePoints, setTelePoints] = React.useState({
        speaker: "0", speakerMisses: "0", 
        amp: "0", ampMisses: "0", 
    });
    const setTelePointParam = (parameter, value) => {
        const temp = {...telePoints};
        temp[parameter] = value;
        setTelePoints(temp);
    }
    
    const [teleParked, setTelePark] = React.useState(false);
    const [teleClimb, setTeleClimb] = React.useState(false);
    const [comments, setComments] = React.useState("");

    // Prevents nothing entries
    const formatNumericState = (state) => {
        return ((state != "") ? Number(state) : 0);
    }

    // Serializes the data to a string and saves it
    const saveAndExit = async () => {
        const matchData = [
            // Pre Round
            formatNumericState(teamNumber), 
            formatNumericState(matchNumber),
            matchType != "Match Type" ? matchTypeValues.indexOf(matchType) : 1, 
            teamColor != "Team Color" ? teamColorValues.indexOf(teamColor) : 0, 

            // Auto
            taxi ? 1 : 0,
            formatNumericState(autoPoints.speaker),
            formatNumericState(autoPoints.speakerMisses),
            formatNumericState(autoPoints.amp),
            formatNumericState(autoPoints.ampMisses),
            formatNumericState(autoPoints.misses),

            // Teleop
            formatNumericState(telePoints.speaker),
            formatNumericState(telePoints.speakerMisses),
            formatNumericState(telePoints.amp),
            formatNumericState(telePoints.ampMisses),
            formatNumericState(telePoints.misses),
            teleParked ? 1 : 0,
            teleClimb ? 1 : 0,

            // After Round
            comments,
        ];

        // Save data using hash
        try {
            await saveMatchData(matchData)
            navigation.navigate("Home");
        } catch (e) {
            console.error(`Error Saving Data: ${e}`);
        }
    };

    const loadSavedData = (data) => {
        // Pre Round
        setTeamNumber(data[0]);
        setMatchNumber(data[1]);
        setMatchType(matchTypeValues[data[2]]);
        setTeamColor(teamColorValues[data[3]]);

        // Auto
        setTaxi(Number(data[4]) ? true : false);
        setauto(Number(data[5]) ? true : false);
        const autoPoints = {
            speaker: data[8], speakerMisses: data[9],
            amp: data[11], ampMisses: data[12],
        }
        setAutoPoints(autoPoints);

        // Teleop
        const telePoints = {
            speaker: data[15], speakerMisses: data[16],
            amp: data[18], ampMisses: data[19],
        }
        setTelePoints(telePoints);
        setTelePark(Number(data[21]) ? true : false);
        setTeleClimb(Number(data[22]) ? true : false);

        // After Round
        setComments(data[23]);
    }

    React.useEffect(() => {
        if (route?.params?.matchData) {
            loadSavedData(route.params.matchData);
        }
    }, [])

    const scrollRef = React.useRef(null);

    // Ugly but necessary
    const counterSettings = {
        stateMin: 0,
        stateMax: 99,
        overallStyle: {justifySelf: "center", marginTop: 7*vh},
        topButtonProps: {text: "+", buttonStyle: [globalButtonStyles.topCounterButton, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText},
        inputProps: {style: [globalInputStyles.numberInput, globalTextStyles.labelText, {width: "80%", height: "25%", margin: 0}]},
        bottomButtonProps: {text: "-", buttonStyle: [globalButtonStyles.bottomCounterButton, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText}
    }
    const speakerCounterSettings = {
        stateMin: 0,
        stateMax: 99,
        overallStyle: {justifySelf: "center", marginTop: 7*vh},
        topButtonProps: {text: "+", buttonStyle: [{...globalButtonStyles.topCounterButton, backgroundColor: CS.cube}, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText},
        inputProps: {style: [globalInputStyles.numberInput, globalTextStyles.labelText, {width: "80%", height: "25%", margin: 0}]},
        bottomButtonProps: {text: "-", buttonStyle: [{...globalButtonStyles.bottomCounterButton, backgroundColor: CS.cube}, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText}
    }
    const ampCounterSettings = {
        stateMin: 0,
        stateMax: 99,
        overallStyle: {justifySelf: "center", marginTop: 7*vh},
        topButtonProps: {text: "+", buttonStyle: [{...globalButtonStyles.topCounterButton, backgroundColor: CS.cone}, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText},
        inputProps: {style: [globalInputStyles.numberInput, globalTextStyles.labelText, {width: "80%", height: "25%", margin: 0}]},
        bottomButtonProps: {text: "-", buttonStyle: [{...globalButtonStyles.bottomCounterButton, backgroundColor: CS.cone}, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText}
    }

    return (
        <View style={globalContainerStyles.topContainer}>
        <TTGradient/>

            {/* All scouting settings go in the scroll view */}
            <KeyboardAvoidingView style={{flex: 1}} behavior="height">
            <ScrollView keyboardShouldPersistTaps='handled' ref={scrollRef}>
                <View style={{height: 35*vh, zIndex: 1}}>
                    <Text style={styles.sectionHeader}>Pre-Round</Text>

                    <View style={{...styles.rowAlignContainer, zIndex: 6}}>
                        {/* Team number */}
                        <TTNumberInput
                            state={teamNumber}
                            setState={setTeamNumber}
                            stateMax={9999}
                            maxLength={4}
                            placeholder="Team Number"
                            placeholderTextColor={`${CS.light1}50`}
                            style={styles.topNumberInput}
                        />
                        {/* Team Color */}
                        <TTDropdown 
                            state={teamColor} 
                            setState={setTeamColor} 
                            items={teamColorValues}
                            boxWidth={40*vw}
                            boxHeight={8.1*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                        />
                    </View>

                    {/* Match type and number */}
                    <View style={{...styles.rowAlignContainer, zIndex: 5}}>
                        <TTDropdown 
                            state={matchType} 
                            setState={setMatchType} 
                            items={matchTypeValues}
                            boxWidth={40*vw}
                            boxHeight={8.1*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                            zIndex={5}
                        />
                        <TTNumberInput
                            state={matchNumber}
                            setState={setMatchNumber}
                            maxLength={3}
                            placeholder="Match Number"
                            placeholderTextColor={`${CS.light1}50`}
                            style={styles.topNumberInput}
                        />
                    </View>
                    
                    {/* Rudamentary spacer */}
                    <View style={{marginBottom: 5*vh}}/> 
                </View>

                {/* 
                
                AUTO 
                
                */}
                <View style={{height: 95*vh}}>
                    <TTGradient/>

                    <Text style={styles.sectionHeader}>Auto</Text>
                    
                    <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                        {/* Column for cube and cone high, middle, and low */}
                        <View style={{...globalContainerStyles.columnContainer, flexGrow: 3}}>
                            {/* Cubes */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>

                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Speaker</Text>
                                    <TTCounterInput
                                        state={autoPoints.speaker}
                                        setState={(v) => setAutoPointParam("speaker", v)}
                                        {...speakerCounterSettings}
                                    />
                                </View>

                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Speaker Misses</Text>
                                    <TTCounterInput
                                        state={autoPoints.speakerMisses}
                                        setState={(v) => setAutoPointParam("speakerMisses", v)}
                                        {...speakerCounterSettings}
                                    />
                                </View>
                            </View>
                            {/* Cones */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Amp</Text>
                                    <TTCounterInput
                                        state={autoPoints.amp}
                                        setState={(v) => setAutoPointParam("amp", v)}
                                        {...ampCounterSettings}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Amp Misses</Text>
                                    <TTCounterInput
                                        state={autoPoints.ampMisses}
                                        setState={(v) => setAutoPointParam("ampMisses", v)}
                                        {...ampCounterSettings}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{...styles.rowAlignContainer, flexGrow: 0.3}}>
                        {/* Taxi */}
                        <TTSimpleCheckbox 
                            state={taxi}
                            setState={setTaxi}
                            text="Taxi?" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText, fontSize: 14*fU}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                    </View>
                    <View style={{marginBottom: 2*vh}}/> 
                </View>

                {/* 
                
                TELEOP 
                
                */}
                <View style={{height: 85*vh}}>
                    <TTGradient/>

                    <Text style={styles.sectionHeader}>Teleop</Text>
                    
                    <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                        {/* Column for cube and cone high, middle, and low */}
                        <View style={{...globalContainerStyles.columnContainer, flexGrow: 3}}>
                            {/* Cubes */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cube Mid</Text>
                                    <TTCounterInput
                                        state={telePoints.speaker}
                                        setState={(v) => setTelePointParam("speaker", v)}
                                        {...speakerCounterSettings}
                                    />
                                </View>

                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cube Low</Text>
                                    <TTCounterInput
                                        state={telePoints.speakerMisses}
                                        setState={(v) => setTelePointParam("speakerMisses", v)}
                                        {...speakerCounterSettings}
                                    />
                                </View>
                            </View>
                            {/* Cones */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cone Mid</Text>
                                    <TTCounterInput
                                        state={telePoints.amp}
                                        setState={(v) => setTelePointParam("amp", v)}
                                        {...ampCounterSettings}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cone Low</Text>
                                    <TTCounterInput
                                        state={telePoints.ampMisses}
                                        setState={(v) => setTelePointParam("ampMisses", v)}
                                        {...ampCounterSettings}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                
                {/* 
                
                ENDGAME 
                
                */}
                <View style={{height: 50*vh}}>
                    <TTGradient/>

                    <Text style={styles.sectionHeader}>Endgame</Text>
                    
                    <View style={{...styles.rowAlignContainer, flexGrow: 0.3}}>
                        <TTSimpleCheckbox 
                            state={teleParked}
                            setState={setTelePark}
                            text="Parked?" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                        <TTSimpleCheckbox 
                            state={teleClimb}
                            setState={setTeleClimb}
                            text="Engaged?" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                    </View>
                    <View style={styles.rowAlignContainer}>
                        <TTTextInput
                            state={comments}
                            setState={setComments}
                            placeholder="Comments (50 characters)"
                            placeholderTextColor={`${CS.light1}50`}
                            multiline={true}
                            maxLength={50}
                            numberOfLines={4}
                            onFocus={() => {scrollRef.current.scrollToEnd()}}
                            style={[
                                {...globalInputStyles.numberInput, width: "90%", height: "90%"},
                                globalTextStyles.labelText
                            ]}
                        />
                    </View>

                    {/* Rudamentary spacer */}
                    <View style={{marginBottom: 5*vh}}/> 
                </View>
                
                <View style={{...globalContainerStyles.centerContainer, backgroundColor: "#00000000"}}>
                    <TTButton
                        text="Save Data"
                        buttonStyle={{...globalButtonStyles.primaryButton, width: "90%", margin: 5*vh}}
                        textStyle={{...globalTextStyles.primaryText, fontSize: 36*fU}}
                        onPress={saveAndExit}
                    />
                </View>

            </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// !! TODO !! REPLACE ALL MASSIVE INLINE STYLES WITH A STYLESHEET
const styles = StyleSheet.create({
    sectionHeader: {
        ...globalTextStyles.primaryText, 
        fontSize: 24*fU, 
        margin: 1.5*vh
    },
    topNumberInput: {
        ...globalInputStyles.numberInput, 
        ...globalTextStyles.labelText,
        margin: 0,
        width: 45*vw, 
        height: 8*vh,
    },
    rowAlignContainer: {
        ...globalContainerStyles.rowContainer, 
        width: "100%", 
        alignItems: "center", 
        justifyContent: "space-evenly",
    },
    counterHeader: {
        ...globalTextStyles.labelText, 
        fontSize: 15*fU, 
        alignSelf: "center", 
        position: "absolute", 
        top: 2.6*vh
    }
});

// Exports
export default ScoutTeam;

export { matchTypeValues, teamColorValues };