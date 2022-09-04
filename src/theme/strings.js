const strings = {
  app_name: 'SenSights',
  cancel: 'Cancel',
  login_to_your_account: 'Login to Your Account',
  in_app_disclosure:
    'This App collects your location information in the background, to assist Caregivers to provide timely care and support emergency response actions.',
  email: 'Email',
  password: 'Password',
  forgot_your_password: 'Forgot your password?',
  login: 'Log In',
  safe_home: 'Safe@Home',
  safe_work: 'Safe2Work',
  safe_home_dec:
    'An easy-to-use mental health and well-being intelligent platform for seniors & caregivers, that aims to track the progress of early cognitive decline based on risk-levels. ',
  safe_work_dec:
    'A non-invasive platfrom offering real-time risk monitoring, early detection and health screening of potential infection, ensuring care organizations and their staff members are Safe2Work.',
  not_yet_a_member: 'Not yet a member?',
  signup: 'Sign Up',
  google_plus: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
  or_log_in_with: 'or login with',
  or_sign_up_with: 'or sign up with',
  info_text:
    'Be honest, a little more excercise and control on fats in diet could make you more healthier',
  welcome_to_sensights: 'Welcome to SenSights.AI',
  tm: '',
  we_have_sense_to_stay_connected: 'We have the sense to stay connected',
  by_locateMotion: 'By LocateMotion',
  today_activity: 'Today’s Activity',
  // be_honest:
  //   "Be honest, a little more excercise and control on fats in diet could make you more healthier. ",
  heart_rate_analysis: 'Heart Rate Zone Analysis',
  last_locations: 'Location',
  show_all: 'Show all',
  statistics: 'Health Data', // "Statistics",
  infection_risk: 'Infection Risk',
  infection_risk_Assessment_Result_Screen: 'Infection Risk Assessment',
  infection_risk_string: 'Self Assessment Screen',
  infection_risk_assesment: 'COVID-19 Daily Screening',
  heart_rate: 'Heart Rate',
  stress_level: 'Stress Level',
  respiratoryLevel: 'Respiratory Rate',
  steps_count: 'Step Count',
  temperature: 'Body Temperature',
  bloodPressure: 'Blood Pressure',
  pulseOximeter: 'Pulse Oximeter',
  glucometer: 'Blood Glucose',
  o2_saturation: 'Oxygen Saturation Rate (%)',
  last_night_sleet: "Last Night's Sleep",
  home: 'Home',
  social: 'Social',
  save: 'Save',
  next: 'Next',
  submit: 'Submit',
  step_1: 'Step 1:',
  step_2: 'Step 2:',
  select_wrk_status: 'Select Working Status',
  select_device:
    'Select a device to take in a reading from or enter the information yourself',
  temp_note: 'Note: Temperature must be entered manually',
  pulse_rate_info:
    'The number of times your heart beats per minute. Measured in beats per minute (bpm).',
  oxigen_info_info:
    'The percentage of hemoglobin in the blood that is saturated with oxygen, otherwise known as your SpO2 or O2 sat level. Measured in %.',
  body_temperature_info:
    'The temperature of your body. Measured in degrees Celsius or Fahrenheit. To change Celsius or Fahrenheit go to profile',
  infection_result_array: [
    'Practice physcial distancing. This is not the same as self-isolation. You do not need to remain indoors, but you do need to avoid being in close contact with people.',
    'Practice good hygiene: wash hands often, cover coughs and sneezes, and avoid touching your face.',
    'Monitor for COVID-19 symptoms: fever, cough, shortness of breath, difficulty breathing, sore throat or runny nose',
    'If you develop any COVID-19 symptoms, stay home and take this self-assessment again',
  ],
  result_screen_bottom:
    'Our infection Risk Assessment follows the COVID-19 screening guidlines and symptoms detection of Ontario Ministry of Heatlh (Ontario Regulation 364/20) and guidlines of CDC risk assessment & symptoms testing',
  result_screen_bottom_link_one:
    'http://www.health.gov.on.ca/en/pro/programs/publichealth/coronavirus/docs/wrokplace_screening_tool_guidance.pdf',
  result_screen_bottom_link_two:
    'http://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html;',

  infection_instructions:
    '*Close contact includes providing care, living with or otherwise having close prolonged contact (within 2 metres) while the person was ill, or contact with infectious bodily fluids (e.g. cough or sneeze) while not wearing recommended personal protective equipment',
  result_no_test_needed:
    'You do not have any symptoms of COVID-19. You may enter your workplace. We recommend you to continue monitoring your health closely.',
  //"You do not have any symptoms, we recommend that you continue to closely monitor your health and practice social disancing",
  result_test_needed:
    'You may have some symptoms of COVID-19.  You are advised to NOT enter your workplace. You should self-isolate and contact your healthcare provider or Telehealth Ontario to find out if you need a COVID-19 test.',
  disconnect: 'Disconnect',

  alertsDescription:
    'Note:\nAmber Alert generated if reading is outside the boundary range.\n\nRed Alert generated if reading is outside the boundary range, beyond the % level set below.',
  //alertsDescription: 'Note:\nBy Changing the lower and upper boundaries, alerts will only come through once an individuals readings are outside of this range',
  chat: 'Services',
  services: 'Services',
  profile: 'Profile',
  time: 'Time',
  distance: 'Distance',
  avg_speed: 'Avg. Speed',
  back: 'Back',
  create_geofence: 'Create Geofence',
  previous_locations: 'Previous Locations',
  ride_request: 'Ride Request',
  registered_seniors: 'Registered Staff Members',
  tasks: 'Tasks',
  tracking: 'Tracking',
  enter_email: 'Enter valid email address',
  enter_password: 'Enter password',
  limit_added_successfully: 'Geofence limit has been saved successfully',
  call_fail_error: 'Unable to process request at the moment, try again later',
  activity_score: 'Activity Score',
  see_all: 'See All',
  call_number: '+922321234567',
  sms_number: '+922321234567',
  chat_url: 'https://partners.yourdoctors.online/?partners=locatemotion',
  social_url: 'https://www.linkedin.com/company/locatemotion/',
  tutorial1_desc:
    'We enable delivery of prompt and timely care, through remote monitoring of health & wellness parameters in real-time.',
  tutorial1_title: 'Improved Health Outcomes',
  tutorial2_desc:
    'We safeguard frontline care workers and patients through real-time risk monitoring of infections and chronic conditions.',
  tutorial2_title: 'Reduced Health Risks',
  tutorial3_desc:
    'We achieve convenience and efficiency through seamless integration of devices, apps, data and healthcare systems.',
  tutorial3_title: 'Simplicity and Efficiency',
  new_password: 'New Password',
  old_passowrd: 'Old Password',
  confirm_password: 'Confirm Password',
  reset_password: 'Reset Password',
  send_mail: 'Send Mail',
  forgot_password: 'Forgot Password?',
  password_not_match: 'Passwords no matched Kindly try again',
  minimum_password_length: 'Password must be minimum 8 characters',
  code_not_found: 'Please Enter the 6-Digit code',
  locationInformation:
    "This page shows the Location and Geofences, as descibed below:\n\n - The Red marker shows the current (or most recently recorded) Location.\n- The Blue markers and surrounding circles indicate the current Geofences.\n- The Refresh icon adjusts the map to view all existing Geofences.\n- To create a new Geofence, press the pencil icon button.\n- To see the full list of created Geofences press list button at bottom left corner. \n- To see the most recent Locations, press 'Show All.",
  activityScoreInformation:
    'The blue bars indicate your daily Activity Scores, which is calculated using our proprietary algorithm, and provides you an overview of your level of activity today and over the past week.',
  heartRateInformation:
    'The graph will show heart rate data for maximum last 30 days, you can hover on graph to see particular day value. Below is list of each day average, you can long press to see that day complete graph and hover to see specific time value.\nAverage value is between 60-100.',
  stepCountInformation:
    'The graph will show step count data for maximum last 30 days, you can hover on graph to see particular day value. Below is list of each day total steps, you can long press to see that day complete graph and hover to see specific time value.\nAverage value is between 2000-8000.',
  manualDataInputDescription:
    'Enter current values of Body Temperature and Oxygen Saturation, Data will be saved in database with proper data and time stamp',
  locateMotionWeb: 'https://locatemotion.com/terms-and-agreement/',
  manuallyReadings_info: {
    heartRate: 'Heart Rate value must be between 1- 250 BPM',
    respiratoryLevel: 'Respiratory rate must be between 1-70 RPM',
    heartRateVarability: 'HRV Rate value must be between 1-300 ms',
    bodyTemp:
      'Body Temperature must be between 1-60 C',
    oxygenSaturation: 'Oxygen Saturation must be between 1-100 %',
    bloodGlucose: 'Blood Glucose Level must be between 1- 700 mg/dL',
    stepCount: 'Step count must be between 1-9999',
    sleep: 'Sleep must be between 1-24 hrs',
    weight: 'Weight must be between 1-400 kg',
    fall: 'Enter the number of Falls within the previous day.',
    stressLevel: 'Select the Stress Level.',
    systolicBP: 'Systolic must be between 1-350 mmHg',
    diastolicBP: 'Diastolic must be between 1-350 mmHg',
  },
};

export default strings;
