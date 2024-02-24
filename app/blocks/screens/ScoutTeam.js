// Library imports
import * as React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Component imports
import { fU, vh, vw } from '../../common/Constants';
import { globalButtonStyles, globalInputStyles, globalTextStyles, globalContainerStyles } from '../../common/GlobalStyleSheet';
import { TTButton, TTCheckbox, TTPushButton, TTSimpleCheckbox } from '../components/ButtonComponents';
import { TTCounterInput, TTDropdown, TTNumberInput, TTTextInput } from '../components/InputComponents';
import { serializeData, deserializeData, compressData, decompressData, saveMatchData, loadDevice, loadMatchData,loadOtherSettings, loadTbaEventCache, loadMatchCache, saveMatchCache} from '../../common/LocalStorage'
import { TTGradient } from '../components/ExtraComponents';
import { ColorScheme as CS } from '../../common/ColorScheme';

const matchTypeValues = ["Practice", "Quals", "Finals"];
const teamColorValues = ["Red", "Blue"];
const deviceValues = ["Blue 1","Blue 2","Blue 3","Red 1","Red 2","Red 3"];

// Main function
const ScoutTeam = ({route, navigation}) => {
    // Might be good to make some of these into arrays
    
    const [scouterName, setScouterName] = React.useState("");
    const [device, setDevice] = React.useState("Device");
    const [dataType, setDataType] = React.useState("Match");
    const [teamNumber, setTeamNumber] = React.useState("");
    const [matchNumber, setMatchNumber] = React.useState("");
    const [matchType, setMatchType] = React.useState("Match Type");
    const [teamColor, setTeamColor] = React.useState("Team Color");

    const [leave, setLeave] = React.useState(false);
    const [centerlineNoteScored, setCenterlineNoteScored] = React.useState(false);
   
    const [autoPoints, setAutoPoints] = React.useState({
        speaker: "0", 
        amp: "0", 
        speakermiss: "0", 
        ampmiss: "0"
    });

    const setAutoPointParam = (parameter, value) => {
        const temp = {...autoPoints};
        temp[parameter] = value;
        setAutoPoints(temp);
    };

    const [telePoints, setTelePoints] = React.useState({
        speaker: "0", 
        amp: "0", 
        amplifiedSpeaker: "0",
        speakermiss: "0", 
        ampmiss: "0"
    });

    const setTelePointParam = (parameter, value) => {
        const temp = {...telePoints};
        temp[parameter] = value;
        setTelePoints(temp);
    }
    
    const [trap, setTrap] = React.useState(false);
    const [park, setPark] = React.useState(false);
    const [spotlit, setSpotlit] = React.useState(false);
    const [harmony, setHarmony] = React.useState(false);
    const [stage, setStage] = React.useState(false);
    
    const [eventKey, setEventKey] = React.useState("");
    const [comments, setComments] = React.useState("");


    // Prevents nothing entries
    const formatNumericState = (state) => {
        return ((state != "") ? Number(state) : 0);
    }
    const formatNameState = (state) => {
        return ((state != "") ? state.trim() : 0);
    }
    // Serializes the data to a string and saves it
    const saveAndExit = async () => {
        const matchData = [
            // Pre Round
            dataType, //0
            formatNameState(scouterName),//1
            device != "Device" ? deviceValues.indexOf(device) : 0, //2
            formatNumericState(teamNumber), //3
            formatNumericState(matchNumber), //4
            matchType != "Match Type" ? matchTypeValues.indexOf(matchType) : 1, //5
            teamColor != "Team Color" ? (device.includes("Blue")?"Blue":"Red") : 0, //6

            // Auto
            leave ? 1 : 0, //7
            centerlineNoteScored?1:0, //8
            formatNumericState(autoPoints.speaker), //9
            formatNumericState(autoPoints.speakermiss), //10
            formatNumericState(autoPoints.amp), //11
            formatNumericState(autoPoints.ampmiss), //12

            // Teleop
            formatNumericState(telePoints.speaker), //13
            formatNumericState(telePoints.amplifiedSpeaker), //14
            formatNumericState(telePoints.speakermiss), //15
            formatNumericState(telePoints.amp), //16
            formatNumericState(telePoints.ampmiss), //17

            trap ? 1 : 0, //18
            park ? 1 : 0, //19
            harmony ? 1 : 0, //20
            spotlit ? 1 : 0, //21
            stage ? 1 : 0, //22

            // After Round
            eventKey, //23
            comments, //24
        ];

        const matchCache = {
            'scouterName' : formatNameState(scouterName),
            'matchNumber' : formatNumericState(matchNumber),
            'matchType' : matchType
        };

        // Save data using hash
        try {
            await saveMatchData(matchData);
            await saveMatchCache(matchCache);
            navigation.navigate("Home");
        } catch (e) {
            console.error(`Error Saving Data: ${e}`);
        }
    };

    const loadSavedData = (data) => {
        // Pre Round
        setDataType(data[0]);
        setScouterName(data[1]);
        setDevice(deviceValues[data[2]]);
        setTeamNumber(data[3]);
        setMatchNumber(data[4]);
        setMatchType(matchTypeValues[data[5]]);
        setTeamColor(teamColorValues[data[6]]);

        // Auto
        setLeave(Number(data[7]) ? true : false);
        setCenterlineNoteScored(Number(data[8]) ? true : false);
        const autoPoints = {
            speaker: data[9], speakermiss: data[10], 
            amp: data[11], ampmiss: data[12]
        }
        setAutoPoints(autoPoints);

        // Teleop
        const telePoints = {
            speaker: data[13], amplifiedSpeaker: data[14], speakermiss: data[15],
            amp: data[16], ampmiss: data[17]
        }
        setTelePoints(telePoints);
        
        setTrap(Number(data[18]) ? true : false);
        setPark(Number(data[19]) ? true : false);
        setHarmony(Number(data[20]) ? true : false);
        setSpotlit(Number(data[21]) ? true : false);
        setStage(Number(data[22]) ? true : false);

        // After Round
        
        setEventKey(data[23]);
        setComments(data[24]);
    }
    

    React.useEffect(() => {
        //Load setting defaults from tba and other settings if configured. 
        const loadOtherSettingsToState = async () => {
            //Get Other Settings used to pull TBA data and determine device
            const loadedOtherSettings = await loadOtherSettings();
            if(loadedOtherSettings){
                if(loadedOtherSettings.eventKey){
                    setEventKey(loadedOtherSettings.eventKey);
                }
            };

            const loadedDevice = await loadDevice();
            if (loadedDevice) {
                if(loadedDevice.device){
                    setTeamColor(loadedDevice.device.includes("Blue")?"Blue":"Red");
                    setDevice(loadedDevice.device);
                }
            }
            //GetMatchCache which stores the last match data
            const loadMatch = await loadMatchCache()
           
            if (loadMatch) {
               
                if (loadMatch.matchNumber==="0"){
                    setMatchNumber("1");
                } else {
                    setMatchNumber((Number(loadMatch.matchNumber) + 1).toString())
                }
                setScouterName(loadMatch.scouterName);
                setMatchType(loadMatch.matchType);
            } else {
                setMatchNumber("1");
                setMatchType("Qualifiers");
            };
            //GetTBAEventMatchData to populate the team number
            const loadTbaEvent = await loadTbaEventCache();
            //console.log(loadTbaEvent);
            if (loadTbaEvent) {
                for (i = 0; i < JSON.parse(loadTbaEvent).length; i++) {
                    const data = JSON.parse(loadTbaEvent)[i];
                    var mt = "Qualifiers";
                    var mn = 1;                
                    try{
                        if (loadMatch) {
                            mt = loadMatch.matchType;
                            mn = String(Number(loadMatch.matchNumber) + 1);
                        }  
                        
                        if (data.eventkey == loadedOtherSettings.eventKey
                        && (mt == "Qualifiers")
                        && data.complevel == "qm"
                        && mn == String(data.matchnumber)) {

                        var team = "";
                        switch(loadedDevice.device) {
                            case "Blue3":
                                team = data.blue3.replace("frc","");
                                break;
                            case "Blue2":
                                team =data.blue2.replace("frc","");
                                break;
                            case "Blue1":
                                team = data.blue1.replace("frc","");
                                break;
                            case "Red3":
                                team = data.red3.replace("frc","");
                                break;
                            case "Red2":
                                team = data.red2.replace("frc","");
                                break;
                            case "Red1":
                                team = data.red1.replace("frc","");
                                break;
                            default:
                                team = "";
                                break;
                            };
                            //console.log(team);
                            setTeamNumber(team);
                        };
                    } catch(e) {
                        console.error(e);
                    }
                };
            } else {
                setTeamNumber("");
            };

        };       
        
        //Load data if a prior scouting match was passed to page. 
        if (route?.params?.matchData) {
            loadSavedData(route.params.matchData);
        } else {
            loadOtherSettingsToState();  
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
    const cubeCounterSettings = {
        stateMin: 0,
        stateMax: 99,
        overallStyle: {justifySelf: "center", marginTop: 7*vh},
        topButtonProps: {text: "+", buttonStyle: [{...globalButtonStyles.topCounterButton, backgroundColor: CS.cube}, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText},
        inputProps: {style: [globalInputStyles.numberInput, globalTextStyles.labelText, {width: "80%", height: "25%", margin: 0}]},
        bottomButtonProps: {text: "-", buttonStyle: [{...globalButtonStyles.bottomCounterButton, backgroundColor: CS.cube}, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText}
    }
    const coneCounterSettings = {
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
                <View style={{height: 50*vh, zIndex: 1}}>
                    <Text style={styles.sectionHeader}>Pre-Round</Text>

                    <View style={{...styles.rowAlignContainer, zIndex: 7}}>
                        {/* Team Number */}
                 
                        <TTNumberInput
                          state={teamNumber}
                          setState={setTeamNumber}
                          stateMax={9999}
                          maxLength={4}
                          placeholder="Team #"
                          placeholderTextColor={`${CS.light1}50`}
                          style={styles.topNumberInput}
                        />
                           
                    </View>

                    <View style={{...styles.rowAlignContainer, zIndex: 7}}>
                 
                        {/* Device */}
                        <TTDropdown 
                            state={device} 
                            setState={setDevice} 
                            items={deviceValues}
                            boxWidth={40*vw}
                            boxHeight={5*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                        />
                    
                    {/* Match type */}
                        <TTDropdown 
                            state={matchType} 
                            setState={setMatchType} 
                            items={matchTypeValues}
                            placeholder="Match Type"
                            placeholderTextColor={`${CS.light1}50`}
                            boxWidth={40*vw}
                            boxHeight={5*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                            zIndex={5}
                        />
                    </View>
                    <View style={{...styles.rowAlignContainer, zIndex: 5}}>
                      
                        <TTNumberInput
                            state={matchNumber}
                            setState={setMatchNumber}
                            maxLength={3}
                            placeholder="Match #"
                            placeholderTextColor={`${CS.light1}50`}
                            style={styles.topNumberInput}
                        />
                     
                        {/* Scouter Name */}
                        <TTTextInput
                        state={scouterName}
                            setState={setScouterName}
                            maxLength={30}
                            placeholder="Scouter Name"
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
                <View style={{height: 85*vh}}>
                    <TTGradient/>

                    <Text style={styles.sectionHeader}>Auto</Text>
                    
                    <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                        <View style={{...globalContainerStyles.columnContainer, flexGrow: 3}}>
                            {/* speaker */}

                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                            <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Speaker </Text>
                                    <View style={{marginBottom: 10*vh}}/> 

                                    <TTCounterInput
                                        state={autoPoints.speaker}
                                        setState={(v) => setAutoPointParam("speaker", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Speaker Misses</Text>
                                                        <View style={{marginBottom: 10*vh}}/> 

                                    <TTCounterInput
                                        state={autoPoints.speakermiss}
                                        setState={(v) => setAutoPointParam("speakermiss", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>
                                </View>
                                <View style={{marginBottom: 5*vh}}/> 

                                <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                </View>
                            {/* amp */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Amp</Text>
                                    <View style={{marginBottom: 10*vh}}/> 

                                    <TTCounterInput
                                        state={autoPoints.amp}
                                        setState={(v) => setAutoPointParam("amp", v)}
                                        {...coneCounterSettings}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Amp Misses</Text>
                                    <View style={{marginBottom: 10*vh}}/> 

                                    <TTCounterInput
                                        state={autoPoints.ampmiss}
                                        setState={(v) => setAutoPointParam("ampmiss", v)}
                                        {...coneCounterSettings}
                                    />
                                </View>
                            </View>
                            <View style={{marginBottom: 5*vh}}/> 

                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                <View style={globalContainerStyles.columnContainer}>
                                    <TTSimpleCheckbox 
                                        state={centerlineNoteScored}
                                        setState={setCenterlineNoteScored}
                                        text="Center Auto" 
                                        overallStyle={{height: "100%", alignSelf: "center"}}
                                        textStyle={{...globalTextStyles.labelText, fontSize: 12*fU}}
                                        boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                                        boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <TTSimpleCheckbox 
                                        state={leave}
                                        setState={setLeave}
                                        text="Taxi    " 
                                        overallStyle={{height: "100%", alignSelf: "center"}}
                                        textStyle={{...globalTextStyles.labelText, fontSize: 12*fU}}
                                        boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                                        boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                                    />
                                </View>
                            
                            </View>

                        </View>
                    </View>
                </View>

                {/* 
                
                TELEOP 
                
                */}
                <View style={{height: 85*vh}}>
                    <TTGradient/>

                    <Text style={styles.sectionHeader}>Teleop</Text>
                    
                    <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                        <View style={{...globalContainerStyles.columnContainer, flexGrow: 3}}>
                            {/* speaker */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Speaker</Text>
                                    <TTCounterInput
                                        state={telePoints.speaker}
                                        setState={(v) => setTelePointParam("speaker", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Amplified Speaker</Text>
                                    <TTCounterInput
                                        state={telePoints.amplifiedSpeaker}
                                        setState={(v) => setTelePointParam("amplifiedSpeaker", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Speaker Misses</Text>
                                    <TTCounterInput
                                        state={telePoints.speakermiss}
                                        setState={(v) => setTelePointParam("speakermiss", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>
                            </View>
                            {/* amp */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Amp</Text>
                                    <TTCounterInput
                                        state={telePoints.amp}
                                        setState={(v) => setTelePointParam("amp", v)}
                                        {...coneCounterSettings}
                                    />
                                </View>                               
                                
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Amp Misses</Text>
                                    <TTCounterInput
                                        state={telePoints.ampmiss}
                                        setState={(v) => setTelePointParam("ampmiss", v)}
                                        {...coneCounterSettings}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                
                {/* 
                
                ENDGAME 
                
                */}
                <View style={{height: 40*vh}}>
                    <TTGradient/>

                    <Text style={styles.sectionHeader}>Endgame</Text>
                    <View style={{...styles.rowAlignContainer, zIndex: 7, flexGrow: 0.3}}>
                    <TTSimpleCheckbox 
                            state={park}
                            setState={setPark}
                            text="Park" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                    <TTSimpleCheckbox 
                            state={trap}
                            setState={setTrap}
                            text="Trap" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                        
                       
                    </View>
                    <View style={{...styles.rowAlignContainer, zIndex: 6, flexGrow: 0.3}}>

              
                        
                        <TTSimpleCheckbox 
                            state={stage}
                            setState={setStage}
                            text="Onstage" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                        <TTSimpleCheckbox 
                            state={spotlit}
                            setState={setSpotlit}
                            text="Spotlit" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                        <TTSimpleCheckbox 
                            state={harmony}
                            setState={setHarmony}
                            text="Harmony" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                        

                    </View>
                    <View style={{...styles.rowAlignContainer, zIndex: 4, flexGrow: 0.5}}>
                        <TTTextInput
                            state={comments}
                            setState={setComments}
                            placeholder="Comments"
                            placeholderTextColor={`${CS.light1}50`}
                            multiline={true}
                            maxLength={100}
                            numberOfLines={4}
                            onFocus={() => {scrollRef.current.scrollToEnd()}}
                            style={[
                                {...globalInputStyles.numberInput, width: "90%", height: "70%"},
                                globalTextStyles.labelText
                            ]} 
                        />
                    </View>

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
        height: 5*vh,
    },
    rowAlignContainer: {
        ...globalContainerStyles.rowContainer, 
        width: "100%", 
        alignItems: "center", 
        justifyContent: "space-evenly",
    },
    counterHeader: {
        ...globalTextStyles.labelText, 
        fontSize: 14*fU, 
        alignSelf: "center", 
        position: "absolute", 
        top: 2.6*vh
    }
});

// Exports
export default ScoutTeam;

export { matchTypeValues, teamColorValues, deviceValues, styles };