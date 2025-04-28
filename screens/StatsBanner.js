import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { database, ref, onValue } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 200;

const CustomBarChart = ({ data, labels, maxValue = 90, isMonthView, activeButton }) => {
    const Y_AXIS_LABELS = [maxValue, maxValue * 2/3, maxValue / 3, 0].map(val => Math.round(val).toString());

    return (
        <View style={styles.chartContainer}>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
                {Y_AXIS_LABELS.map((label, index) => (
                    <Text key={index} style={styles.axisLabel}>
                        {label}
                    </Text>
                ))}
            </View>

            {/* Chart area */}
            <View style={styles.chartContent}>
                {/* Grid lines */}
                <View style={styles.gridLines}>
                    {Y_AXIS_LABELS.map((_, index) => (
                        <View key={index} style={styles.gridLine} />
                    ))}
                </View>

                {/* Bars and labels container */}
                <View style={styles.barsContainer}>
                    {/* Bars */}
                    <View style={styles.barsRow}>
                        {data.map((value, index) => (
                            <View key={index} style={[
                                styles.barWrapper,
                                (activeButton === 'month' || activeButton === 'day') && {
                                    position: 'absolute',
                                    left: `${(index / (data.length - 1)) * 100}%`,
                                    width: '6%',
                                }
                            ]}>
                                <View style={styles.barAndLabelContainer}>
                                    <View 
                                        style={[
                                            styles.bar,
                                            { 
                                                height: `${(Math.min(value, maxValue) / maxValue) * 100}%`,
                                                width: activeButton === 'week' ? 12 : 6,
                                            }
                                        ]} 
                                    />
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* X-axis labels */}
                    <View style={styles.xAxisLabelsContainer}>
                        {labels.map((label, index) => (
                            <View key={index} style={[
                                styles.xAxisLabelWrapper,
                                (activeButton === 'month' || activeButton === 'day') && {
                                    position: 'absolute',
                                    left: `${(index / (labels.length - 1)) * 100}%`,
                                    width: '6%',
                                }
                            ]}>
                                <Text style={[
                                    styles.xAxisLabel,
                                    !label && { opacity: 0 }
                                ]}>
                                    {label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
};

const StatsBanner = () => {
    const [activeButton, setActiveButton] = useState('day');
    const [focusSessions, setFocusSessions] = useState([]);
    const [currentDate, setCurrentDate] = useState(() => {
        const now = new Date();
        return new Date(now.getTime() - (7 * 60 * 60 * 1000)); // Convert to UTC
    });
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{ data: [] }]
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return;

                const userRef = ref(database, `users/${userId}`);
                onValue(userRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data && data.focusSessions) {
                        setFocusSessions(data.focusSessions);
                    }
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        updateChartData();
    }, [activeButton, currentDate, focusSessions]);

    const updateChartData = () => {
        const thailandTime = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
        let labels = [];
        let data = [];

        // Ensure focusSessions is an array
        const validFocusSessions = Array.isArray(focusSessions) ? focusSessions : [];

        try {
            if (activeButton === 'day') {
                // Show every 2 hours (0-22)
                labels = Array.from({length: 24}, (_, i) => {
                    return (i % 2 === 0) ? i.toString() : '';
                });
                data = Array(24).fill(0);

                const currentThailandDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));

                validFocusSessions.forEach(session => {
                    if (!session?.createdAt || !session?.duration) return;
                    
                    // Session date is already in Thailand time, but we need to remove the UTC indicator
                    const sessionDateStr = session.createdAt.replace('Z', '');
                    const sessionDate = new Date(sessionDateStr);
                    const thailandHour = sessionDate.getHours();
                    
                    if (sessionDate.toDateString() === currentThailandDate.toDateString()) {
                        // Parse duration from HH:MM:SS format
                        const [hours, minutes, seconds] = session.duration.split(':').map(Number);
                        const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);;
                        data[thailandHour] += totalMinutes;
                    }
                });

            } else if (activeButton === 'week') {
                labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                data = Array(7).fill(0);

                // Get start of week in Thailand time
                const startOfWeek = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                validFocusSessions.forEach(session => {
                    if (!session?.createdAt || !session?.duration) return;
                    
                    // Session date is already in Thailand time, but we need to remove the UTC indicator
                    const sessionDateStr = session.createdAt.replace('Z', '');
                    const sessionDate = new Date(sessionDateStr);
                    
                    if (sessionDate >= startOfWeek && sessionDate <= endOfWeek) {
                        const dayIndex = sessionDate.getDay();
                        if (dayIndex >= 0 && dayIndex < 7) {
                            // Parse duration from HH:MM:SS format
                            const [hours, minutes, seconds] = session.duration.split(':').map(Number);
                            const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
                            data[dayIndex] += totalMinutes;
                        }
                    }
                });

            } else if (activeButton === 'month') {
                // Show all days of the month
                const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                // Create labels with every third day, but keep empty strings for days in between
                labels = Array.from({length: daysInMonth}, (_, i) => {
                    return (i % 3 === 0) ? (i + 1).toString() : '';
                });
                data = Array(daysInMonth).fill(0);

                // Get start and end of month in Thailand time
                const startOfMonth = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);
                
                const endOfMonth = new Date(startOfMonth);
                endOfMonth.setMonth(endOfMonth.getMonth() + 1);
                endOfMonth.setDate(0);
                endOfMonth.setHours(23, 59, 59, 999);

                validFocusSessions.forEach(session => {
                    if (!session?.createdAt || !session?.duration) return;
                    
                    // Session date is already in Thailand time, but we need to remove the UTC indicator
                    const sessionDateStr = session.createdAt.replace('Z', '');
                    const sessionDate = new Date(sessionDateStr);
                    
                    if (sessionDate >= startOfMonth && sessionDate <= endOfMonth) {
                        const dayIndex = sessionDate.getDate() - 1; // Convert to 0-based index
                        if (dayIndex >= 0 && dayIndex < daysInMonth) {
                            // Parse duration from HH:MM:SS format
                            const [hours, minutes, seconds] = session.duration.split(':').map(Number);
                            const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
                            data[dayIndex] += totalMinutes;
                        }
                    }
                });
            }

            // Ensure values are within range
            data = data.map(val => Math.min(val, 60)); // Cap at 60 minutes

            // Ensure we always have at least one data point
            if (data.length === 0) {
                data = [0];
                labels = [''];
            }

            setChartData({
                labels,
                datasets: [{
                    data,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    strokeWidth: 2
                }]
            });
        } catch (error) {
            console.error('Error updating chart data:', error);
            // Fallback to empty chart
            setChartData({
                labels: [''],
                datasets: [{ data: [0], color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }]
            });
        }
    };

    const handleButtonPress = (button) => {
        setActiveButton(button);
    };

    const navigateDate = (direction) => {
        // Convert current date to Thailand time first
        const thailandDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
        
        if (activeButton === 'day') {
            thailandDate.setDate(thailandDate.getDate() + (direction === 'next' ? 1 : -1));
        } else if (activeButton === 'week') {
            thailandDate.setDate(thailandDate.getDate() + (direction === 'next' ? 7 : -7));
        } else if (activeButton === 'month') {
            thailandDate.setMonth(thailandDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        
        // Convert back to UTC for storage
        const newDate = new Date(thailandDate.getTime() - (7 * 60 * 60 * 1000));
        setCurrentDate(newDate);
    };

    const formatDateDisplay = () => {
        const thailandDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
        
        if (activeButton === 'day') {
            return thailandDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } else if (activeButton === 'week') {
            const startOfWeek = new Date(thailandDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            return `${startOfWeek.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })} - ${endOfWeek.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}`;
        } else if (activeButton === 'month') {
            return thailandDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.banner}>
                <View style={styles.dayContainer}>
                    <TouchableOpacity 
                        style={[styles.dayWrapper, activeButton === 'day' && styles.activeButton]} 
                        onPress={() => handleButtonPress('day')}
                    >
                        <Text style={[styles.Text, activeButton === 'day' && styles.activeText]}>Day</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.dayWrapper, activeButton === 'week' && styles.activeButton]} 
                        onPress={() => handleButtonPress('week')}
                    >
                        <Text style={[styles.Text, activeButton === 'week' && styles.activeText]}>Week</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.dayWrapper, activeButton === 'month' && styles.activeButton]} 
                        onPress={() => handleButtonPress('month')}
                    >
                        <Text style={[styles.Text, activeButton === 'month' && styles.activeText]}>Month</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.dateNavigation}>
                <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
                    <FontAwesomeIcon icon={faChevronLeft} size={16} color="black" />
                </TouchableOpacity>
                <Text style={styles.dateText}>{formatDateDisplay()}</Text>
                <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
                    <FontAwesomeIcon icon={faChevronRight} size={16} color="black" />
                </TouchableOpacity>
            </View>

            <CustomBarChart 
                data={chartData.datasets[0].data} 
                labels={chartData.labels}
                isMonthView={activeButton === 'month'}
                activeButton={activeButton}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    banner: {
        padding: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 25,
        alignItems: 'center',
        width: '100%',
    },
    Text: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
        alignSelf: 'center'
    },
    dayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    dayWrapper: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        paddingVertical: 5,
        alignItems: 'center',
        marginHorizontal: 5,
        borderRadius: 15,
    },
    activeButton: {
        backgroundColor: 'white',
    },
    activeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'black',
        alignSelf: 'center'
    },
    dateNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
        marginVertical: 20,
    },
    navButton: {
        padding: 6,
        backgroundColor: 'white',
        borderRadius: 999
    },
    dateText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    chartContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        height: CHART_HEIGHT,
        flexDirection: 'row',
        width: '100%',
    },
    yAxisLabels: {
        justifyContent: 'space-between',
        paddingRight: 8,
        height: '80%',
        width: 35,
        marginTop: 10,
    },
    axisLabel: {
        color: 'black',
        fontSize: 12,
        alignSelf: 'center'
    },
    chartContent: {
        flex: 1,
        paddingLeft: 8,
    },
    gridLines: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        height: '80%',
        justifyContent: 'space-between',
    },
    gridLine: {
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        width: '100%',
    },
    barsContainer: {
        height: '100%',
        flex: 1,
        paddingTop: 10,
        position: 'relative',
    },
    barsRow: {
        flexDirection: 'row',
        height: '80%',
        justifyContent: 'space-between',
        position: 'relative',
        marginBottom: 20,
    },
    barWrapper: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-end',
        flex: 1,
    },
    barAndLabelContainer: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        left: -10
    },
    bar: {
        backgroundColor: 'rgba(255, 232, 188, 1)',
        borderRadius: 3,
    },
    xAxisLabelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 20,
        position: 'relative',
        marginTop: 0,
        width: '100%',
        left: -10
    },
    xAxisLabelWrapper: {
        alignItems: 'center',
        flex: 1,
        marginTop: 0,
        height: 20,
        justifyContent: 'center',
    },
    xAxisLabel: {
        color: 'black',
        fontSize: 10,
        textAlign: 'center',
        position: 'absolute',
        width: '100%',
    },
});

export default StatsBanner;