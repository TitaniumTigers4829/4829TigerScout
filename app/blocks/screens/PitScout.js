// Library imports
import * as React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Modal,KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, CameraType, PermissionStatus } from 'expo-camera';

// Component imports
import { fU, vh, vw } from '../../common/Constants';
import { globalButtonStyles, globalInputStyles, globalTextStyles, globalContainerStyles } from '../../common/GlobalStyleSheet';
import { TTButton, TTCheckbox, TTPushButton, TTSimpleCheckbox } from '../components/ButtonComponents';
import { TTCounterInput, TTDropdown, TTNumberInput, TTTextInput } from '../components/InputComponents';
import { serializeData, deserializeData, compressData, decompressData, savePitData, loadPitData,loadOtherSettings} from '../../common/LocalStorage'
import { TTGradient } from '../components/ExtraComponents';
import { ColorScheme as CS } from '../../common/ColorScheme';

// Main function
const PitScout = ({route, navigation}) =>
{    
    const [scouterName, setScouterName] = React.useState("");
    const [teamNumber, setTeamNumber] = React.useState("");
    const [driveTrain, setDriveTrain] = React.useState("Drive Train");
    const driveTrainValues = ["Swerve", "Tank", "Other"];
    const [motors, setMotors] = React.useState("Motors");
    const motorValues = ["Brushless","Brushed","Both"];    
    const [batteries, setBatteries] = React.useState("");
    const [weight, setWeight] = React.useState("");
    const [humanPlayer, setHumanPlayer] = React.useState("Human Player");
    const [climb, setClimb] = React.useState("Climb");
    const climbValues = ["Center","Edge", "Both", "None"];
    const [trap, setTrap] = React.useState("Trap");
    const trapValues = ["Climb","Shoot", "None"];
    const [underStage, setUnderStage] = React.useState("");
    const [amp, setAmp] = React.useState("");
    const [shootingLocation, setShootingLocations] = React.useState("Shooting Area");
    const ShootingLocationValues = ["Subwoofer", "Mid", "Far", "Sub & Mid", "All", "None"];

    const [comments, setComments] = React.useState("");
    const [eventKey, setEventKey] = React.useState("");
    const [dataType, setDataType] = React.useState("Pit");
   
    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }
    // Prevents nothing entries
    const formatNumericState = (state) => {
        return ((state != "") ? Number(state) : 0);
    }
    const formatNameState = (state) => {
        return ((state != "") ? state.trim() : 0);
    }
    // Serializes the data to a string and saves it
    const saveAndExit = async () => {
        const pitData = [
            dataType, //0
            // Pre Round
            formatNameState(scouterName), //1
            formatNumericState(teamNumber), //2

            /* pit data */
            formatNameState(driveTrain), //3
            formatNameState(motors), //4
            formatNameState(batteries), //5
            formatNumericState(weight), //6
            underStage ? 1 : 0, //7
            amp ? 1 : 0, //8
            formatNameState(climb), //9
            formatNameState(trap), //10
            formatNameState(shootingLocation), //11

            // After Round
            eventKey, //12
            comments, //13
        ];

        // Save data using hash
        try {
            await savePitData(pitData);
            navigation.navigate("Home");
        } catch (e) {
            console.error(`Error Saving Data: ${e}`);
        }
    };

    const loadSavedData = (data) => {

        console.log(data);

        setDataType(data[0]);
        // Pre Round
        
        setScouterName(data[1]);
        setTeamNumber(data[2]);

        setDriveTrain(data[3]),
        setMotors(data[4]),
        setBatteries(data[5]),
        setWeight(data[6]),
        setUnderStage( Number(data[7]) ? true : false ),
        setAmp( Number(data[8]) ? true : false ),
        setClimb(data[9]),
        setTrap(data[10]),
        setShootingLocations(data[11]),

        // After Round
        
        setEventKey(data[12]);
        setComments(data[13]);

    }

    React.useEffect(() => {
        //Load setting defaults from tba and other settings if configured. 
        const loadOtherSettingsToState = async () => {
            //Get Other Settings used to pull TBA data and determine device
            const loadedOtherSettings = await loadOtherSettings();
            if(loadedOtherSettings){
                setEventKey(loadedOtherSettings.eventKey);
            };

            setTeamNumber("");   

          

        };
        
        //Load data if a prior scouting match was passed to page. 
        if (route?.params?.pitData) {
            loadSavedData(route.params.pitData);
        } else {
            loadOtherSettingsToState();  
        }

    }, []);

    const scrollRef = React.useRef(null);
    const ref = React.useRef(null);

    return (
        <View style={globalContainerStyles.topContainer}>
        <TTGradient/>

        
            
            {/* All scouting settings go in the scroll view */}
            <KeyboardAvoidingView style={{flex: 1}} behavior="height">
            <ScrollView keyboardShouldPersistTaps='handled' ref={scrollRef}>
                <View style={{height:70*vh, zIndex: 1}}>
                    <View style={{...styles.rowAlignContainer, zIndex: 7}}>
                        {/* ScouterName */}

                        <TTTextInput
                            state={scouterName}
                            setState={setScouterName}
                            maxLength={30}
                            placeholder="Scouter Name"
                            placeholderTextColor={`${CS.light1}50`}
                            style={[
                                {...globalInputStyles.numberInput, width: 45*vw, height: 5*vh},
                                globalTextStyles.labelText
                            ]}
                        />
                        {/* Team number */}
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
                    <View style={{...styles.rowAlignContainer, zIndex: 9}}>

                        <TTNumberInput
                            state={batteries}
                            setState={setBatteries}
                            stateMax={99}
                            maxLength={2}
                            placeholder="Battery #"
                            placeholderTextColor={`${CS.light1}50`}
                            style={styles.topNumberInput}
                        />

                        <TTNumberInput
                            state={weight}
                            setState={setWeight}
                            stateMax={125}
                            maxLength={3}
                            placeholder="Weight"
                            placeholderTextColor={`${CS.light1}50`}
                            style={styles.topNumberInput}
                        />
                        </View>

                    <View style={{...styles.rowAlignContainer, zIndex: 10}}>

                    {/* drive Train */}
                        <TTDropdown 
                            state={driveTrain} 
                            setState={setDriveTrain} 
                            items={driveTrainValues}
                            boxWidth={40*vw}
                            boxHeight={5*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                            zIndex={5}
                        />

                    {/* Motor */}
                        <TTDropdown 
                            state={motors} 
                            setState={setMotors} 
                            items={motorValues}
                            boxWidth={40*vw}
                            boxHeight={5*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                            zIndex={6}
                        />
                    </View>
                    
                   

                    <View style={{...styles.rowAlignContainer, zIndex: 8}}>

                    {/* climb */}
                    <TTDropdown 
                            state={climb} 
                            setState={setClimb} 
                            items={climbValues}
                            boxWidth={40*vw}
                            boxHeight={5*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                            zIndex={7}
                        />
                    
                    {/* shooting locations */}
                        <TTDropdown 
                            state={shootingLocation} 
                            setState={setShootingLocations} 
                            items={ShootingLocationValues}
                            boxWidth={40*vw}
                            boxHeight={5*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                            zIndex={7}
                        />
                    </View>
                    <View style={{...styles.rowAlignContainer, zIndex: 6}}>
                       {/* trap */}
                       <TTDropdown 
                            state={trap} 
                            setState={setTrap} 
                            items={trapValues}
                            boxWidth={40*vw}
                            boxHeight={5*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                            zIndex={6}
                        />
                        </View>
                    
                    <View style={{...styles.rowAlignContainer, zIndex: 5}}>                       

                    {/* under stage */}
                        <TTSimpleCheckbox 
                            state={underStage}
                            setState={setUnderStage}
                            text="Under Stage" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                            {/* under stage */}
                            <TTSimpleCheckbox 
                            state={amp}
                            setState={setAmp}
                            text="Amp" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />


                    </View>


                </View>

                    <View style={styles.rowAlignContainer}>
                        <TTTextInput
                            state={comments}
                            setState={setComments}
                            placeholder="Comments"
                            placeholderTextColor={`${CS.light1}50`}
                            multiline={true}
                            maxLength={1000}
                            numberOfLines={4}
                            onFocus={() => {scrollRef.current.scrollToEnd()}}
                            style={[
                                {...globalInputStyles.numberInput, width: "90%", height: "90%"},
                                globalTextStyles.labelText
                            ]}
                        />
                    </View>

                    {/* Rudamentary spacer */}

                
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    tinyLogo: {
        width: 200,
        height: 200,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
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
        fontSize: 15*fU, 
        alignSelf: "center", 
        position: "absolute", 
        top: 2.6*vh
    }
});


// Exports
export default PitScout;
