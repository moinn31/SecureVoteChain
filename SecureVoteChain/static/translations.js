// Multi-Language Translation System for SecureVoteChain
// Supports: 22 Official Indian Languages + English

const translations = {
    en: {
        // Common
        welcome: "Welcome",
        login: "Login",
        logout: "Logout",
        register: "Register",
        submit: "Submit",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        back: "Back",
        next: "Next",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        
        // Voter Portal
        voterPortal: "Voter Portal",
        voterSubtitle: "✅ Register, Vote, and Verify your participation securely",
        voterId: "Voter ID",
        voterToken: "Voter Token",
        enterVoterId: "Enter your Voter ID",
        enterVoterToken: "Enter your Voter Token",
        voterLogin: "Voter Login",
        secureVoting: "Secure Blockchain Voting",
        currentElections: "Current Elections",
        castYourVote: "Cast Your Vote",
        selectCandidate: "Select Candidate",
        confirmVote: "Confirm Vote",
        voteRecorded: "Vote Recorded Successfully",
        alreadyVoted: "You have already voted",
        noElections: "No active elections available",
        selectState: "Select State",
        voterRegistration: "Voter Registration",
        selectYourState: "Select Your State *",
        aadhaarNumber: "Aadhaar Number (12 digits) *",
        enterAadhaar: "Enter Aadhaar number",
        requestOtp: "Request OTP",
        enterOtp: "Enter OTP",
        enter6DigitOtp: "Enter 6-digit OTP",
        completeRegistration: "Complete Registration",
        
        // Admin Portal
        adminPortal: "Admin Portal",
        adminSubtitle: "🎯 Manage Elections, Monitor Votes, and Ensure Transparency",
        username: "Username",
        password: "Password",
        createElection: "Create Election",
        electionTitle: "Election Title",
        description: "Description",
        startTime: "Start Time",
        endTime: "End Time",
        candidates: "Candidates",
        addCandidate: "Add Candidate",
        dashboard: "Dashboard",
        elections: "Elections",
        voters: "Voters",
        analytics: "Analytics",
        auditLog: "Audit Log",
        settings: "Settings",
        importVoters: "Import Voters",
        exportResults: "Export Results",
        manageElections: "Manage Elections",
        viewResults: "View Results",
        electionStatus: "Election Status",
        pending: "Pending",
        active: "Active",
        ended: "Ended",
        state: "State",
        startDate: "Start Date",
        endDate: "End Date",
        actions: "Actions",
        view: "View",
        adminLogin: "Admin Login",
        adminDashboard: "Admin Dashboard",
        totalVoters: "Total Voters",
        registered: "Registered",
        uploadCsv: "Upload CSV",
        downloadTemplate: "Download Template",
        electionDetails: "Election Details",
        candidateDetails: "Candidate Details",
        uploadPhoto: "Upload Photo",
        uploadLogo: "Upload Logo",
        uploadSymbol: "Upload Symbol",
        
        // Quick Actions & Dashboard
        recentElections: "Recent Elections",
        quickActions: "Quick Actions",
        createNewElection: "Create New Election",
        viewAnalytics: "View Analytics",
        auditLogs: "Audit Logs",
        
        // Create Election Form
        stateForElection: "State for Election",
        electionTitlePlaceholder: "e.g., Maharashtra General Election 2025",
        electionDescriptionPlaceholder: "Enter election description",
        candidateName: "Candidate Name",
        party: "Party",
        clearForm: "Clear Form",
        
        // Import Voters
        importVoterData: "Import Voter Data",
        importVoterDescription: "Upload Excel or CSV file with state-wise voter data (Aadhaar number, name, and state)",
        needTemplate: "Need a template?",
        downloadSampleTemplate: "Download our sample Excel template with the correct format",
        selectOrDropFile: "Select or Drop File Here",
        supportedFormats: "Supported formats: .xlsx, .xls, .csv (Max 10MB)",
        chooseFile: "Choose File",
        importResults: "Import Results",
        
        // Analytics & Audit
        allElections: "All Elections",
        voterTurnoutAnalytics: "Voter Turnout Analytics",
        adminActivityAuditLogs: "Admin Activity Audit Logs",
        refresh: "Refresh",
        auditLogDescription: "All administrative actions are logged for transparency and security",
        
        // Statistics
        statistics: "Statistics",
        voterTurnout: "Voter Turnout",
        totalVotes: "Total Votes",
        totalElections: "Total Elections",
        activeElections: "Active Elections",
        participationRate: "Participation Rate",
        stateWiseBreakdown: "State-wise Breakdown",
        
        // Candidate
        candidateName: "Candidate Name",
        party: "Party",
        symbol: "Symbol",
        viewProfile: "View Profile",
        manifesto: "Manifesto",
        achievements: "Achievements",
        contactInfo: "Contact Information",
        education: "Education",
        occupation: "Occupation",
        
        // Theme
        darkMode: "Dark Mode",
        lightMode: "Light Mode",
        
        // Languages
        language: "Language",
        english: "English",
        hindi: "Hindi",
        tamil: "Tamil",
        telugu: "Telugu",
        bengali: "Bengali",
        marathi: "Marathi",
        gujarati: "Gujarati",
        kannada: "Kannada"
    },
    
    hi: { // Hindi
        // Common
        welcome: "स्वागत है",
        login: "लॉगिन",
        logout: "लॉगआउट",
        register: "पंजीकरण",
        submit: "जमा करें",
        cancel: "रद्द करें",
        save: "सहेजें",
        delete: "हटाएं",
        edit: "संपादित करें",
        back: "पीछे",
        next: "अगला",
        loading: "लोड हो रहा है...",
        error: "त्रुटि",
        success: "सफलता",
        
        // Voter Portal
        voterPortal: "मतदाता पोर्टल",
        voterSubtitle: "✅ अपनी भागीदारी सुरक्षित रूप से पंजीकृत करें, मतदान करें और सत्यापित करें",
        voterId: "मतदाता आईडी",
        voterToken: "मतदाता टोकन",
        enterVoterId: "अपना मतदाता आईडी दर्ज करें",
        enterVoterToken: "अपना मतदाता टोकन दर्ज करें",
        voterLogin: "मतदाता लॉगिन",
        secureVoting: "सुरक्षित ब्लॉकचेन मतदान",
        currentElections: "वर्तमान चुनाव",
        castYourVote: "अपना वोट डालें",
        selectCandidate: "उम्मीदवार चुनें",
        confirmVote: "वोट की पुष्टि करें",
        voteRecorded: "वोट सफलतापूर्वक दर्ज किया गया",
        alreadyVoted: "आप पहले ही वोट डाल चुके हैं",
        noElections: "कोई सक्रिय चुनाव उपलब्ध नहीं है",
        selectState: "राज्य चुनें",
        voterRegistration: "मतदाता पंजीकरण",
        selectYourState: "अपना राज्य चुनें *",
        aadhaarNumber: "आधार संख्या (12 अंक) *",
        enterAadhaar: "आधार संख्या दर्ज करें",
        requestOtp: "OTP का अनुरोध करें",
        enterOtp: "OTP दर्ज करें",
        enter6DigitOtp: "6 अंकों का OTP दर्ज करें",
        completeRegistration: "पंजीकरण पूर्ण करें",
        
        // Admin Portal
        adminPortal: "प्रशासक पोर्टल",
        adminSubtitle: "🎯 चुनाव प्रबंधित करें, वोटों की निगरानी करें और पारदर्शिता सुनिश्चित करें",
        username: "उपयोगकर्ता नाम",
        password: "पासवर्ड",
        createElection: "चुनाव बनाएं",
        electionTitle: "चुनाव का शीर्षक",
        description: "विवरण",
        startTime: "शुरुआत का समय",
        endTime: "समाप्ति का समय",
        candidates: "उम्मीदवार",
        addCandidate: "उम्मीदवार जोड़ें",
        dashboard: "डैशबोर्ड",
        elections: "चुनाव",
        voters: "मतदाता",
        analytics: "विश्लेषण",
        auditLog: "ऑडिट लॉग",
        settings: "सेटिंग्स",
        importVoters: "मतदाता आयात करें",
        exportResults: "परिणाम निर्यात करें",
        manageElections: "चुनाव प्रबंधित करें",
        viewResults: "परिणाम देखें",
        electionStatus: "चुनाव की स्थिति",
        pending: "लंबित",
        active: "सक्रिय",
        ended: "समाप्त",
        state: "राज्य",
        startDate: "प्रारंभ तिथि",
        endDate: "समाप्ति तिथि",
        actions: "कार्रवाई",
        view: "देखें",
        adminLogin: "प्रशासक लॉगिन",
        adminDashboard: "प्रशासक डैशबोर्ड",
        totalVoters: "कुल मतदाता",
        registered: "पंजीकृत",
        uploadCsv: "CSV अपलोड करें",
        downloadTemplate: "टेम्पलेट डाउनलोड करें",
        electionDetails: "चुनाव विवरण",
        candidateDetails: "उम्मीदवार विवरण",
        uploadPhoto: "फोटो अपलोड करें",
        uploadLogo: "लोगो अपलोड करें",
        uploadSymbol: "प्रतीक अपलोड करें",
        
        // Quick Actions & Dashboard
        recentElections: "हाल के चुनाव",
        quickActions: "त्वरित कार्रवाई",
        createNewElection: "नया चुनाव बनाएं",
        viewAnalytics: "विश्लेषण देखें",
        auditLogs: "ऑडिट लॉग",
        
        // Create Election Form
        stateForElection: "चुनाव के लिए राज्य",
        electionTitlePlaceholder: "उदाहरण: महाराष्ट्र आम चुनाव 2025",
        electionDescriptionPlaceholder: "चुनाव का विवरण दर्ज करें",
        candidateName: "उम्मीदवार का नाम",
        party: "पार्टी",
        clearForm: "फॉर्म साफ करें",
        
        // Import Voters
        importVoterData: "मतदाता डेटा आयात करें",
        importVoterDescription: "राज्य-वार मतदाता डेटा के साथ Excel या CSV फ़ाइल अपलोड करें (आधार संख्या, नाम और राज्य)",
        needTemplate: "टेम्पलेट चाहिए?",
        downloadSampleTemplate: "सही प्रारूप के साथ हमारा नमूना Excel टेम्पलेट डाउनलोड करें",
        selectOrDropFile: "यहां फाइल चुनें या छोड़ें",
        supportedFormats: "समर्थित प्रारूप: .xlsx, .xls, .csv (अधिकतम 10MB)",
        chooseFile: "फाइल चुनें",
        importResults: "आयात परिणाम",
        
        // Analytics & Audit
        allElections: "सभी चुनाव",
        voterTurnoutAnalytics: "मतदाता उपस्थिति विश्लेषण",
        adminActivityAuditLogs: "प्रशासक गतिविधि ऑडिट लॉग",
        refresh: "रीफ्रेश करें",
        auditLogDescription: "पारदर्शिता और सुरक्षा के लिए सभी प्रशासनिक कार्यों को लॉग किया जाता है",
        
        // Statistics
        statistics: "आंकड़े",
        voterTurnout: "मतदाता उपस्थिति",
        totalVotes: "कुल वोट",
        totalElections: "कुल चुनाव",
        activeElections: "सक्रिय चुनाव",
        participationRate: "भागीदारी दर",
        stateWiseBreakdown: "राज्य-वार विवरण",
        
        // Candidate
        candidateName: "उम्मीदवार का नाम",
        party: "पार्टी",
        symbol: "प्रतीक",
        viewProfile: "प्रोफ़ाइल देखें",
        manifesto: "घोषणापत्र",
        achievements: "उपलब्धियां",
        contactInfo: "संपर्क जानकारी",
        
        // Theme
        darkMode: "डार्क मोड",
        lightMode: "लाइट मोड",
        
        // Languages
        language: "भाषा",
        english: "अंग्रेज़ी",
        hindi: "हिन्दी",
        tamil: "तमिल",
        telugu: "तेलुगु",
        bengali: "बंगाली",
        marathi: "मराठी",
        gujarati: "गुजराती",
        kannada: "कन्नड़"
    },
    
    ta: { // Tamil
        // Common
        welcome: "வரவேற்பு",
        login: "உள்நுழைய",
        logout: "வெளியேறு",
        register: "பதிவு",
        submit: "சமர்ப்பிக்கவும்",
        cancel: "ரத்துசெய்",
        save: "சேமி",
        delete: "நீக்கு",
        edit: "திருத்து",
        back: "பின்னால்",
        next: "அடுத்து",
        loading: "ஏற்றுகிறது...",
        error: "பிழை",
        success: "வெற்றி",
        
        // Voter Portal
        voterPortal: "வாக்காளர் போர்ட்டல்",
        voterId: "வாக்காளர் ஐடி",
        voterToken: "வாக்காளர் டோக்கன்",
        enterVoterId: "உங்கள் வாக்காளர் ஐடியை உள்ளிடவும்",
        enterVoterToken: "உங்கள் வாக்காளர் டோக்கனை உள்ளிடவும்",
        voterLogin: "வாக்காளர் உள்நுழைவு",
        secureVoting: "பாதுகாப்பான பிளாக்செயின் வாக்களிப்பு",
        currentElections: "தற்போதைய தேர்தல்கள்",
        castYourVote: "உங்கள் வாக்கை பதிவு செய்யுங்கள்",
        selectCandidate: "வேட்பாளரை தேர்ந்தெடுக்கவும்",
        confirmVote: "வாக்கு உறுதிப்படுத்தவும்",
        voteRecorded: "வாக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது",
        alreadyVoted: "நீங்கள் ஏற்கனவே வாக்களித்துவிட்டீர்கள்",
        noElections: "செயலில் உள்ள தேர்தல்கள் எதுவும் இல்லை",
        selectState: "மாநிலத்தை தேர்ந்தெடுக்கவும்",
        voterRegistration: "வாக்காளர் பதிவு",
        selectYourState: "உங்கள் மாநிலத்தைத் தேர்ந்தெடுக்கவும் *",
        aadhaarNumber: "ஆதார் எண் (12 இலக்கங்கள்) *",
        enterAadhaar: "ஆதார் எண்ணை உள்ளிடவும்",
        requestOtp: "OTP கோருங்கள்",
        enterOtp: "OTP உள்ளிடவும்",
        enter6DigitOtp: "6 இலக்க OTP உள்ளிடவும்",
        completeRegistration: "பதிவை முடிக்கவும்",
        
        // Admin Portal
        adminPortal: "நிர்வாக போர்ட்டல்",
        adminSubtitle: "🎯 தேர்தல்களை நிர்வகிக்கவும், வாக்குகளை கண்காணிக்கவும், வெளிப்படைத்தன்மையை உறுதிப்படுத்தவும்",
        username: "பயனர் பெயர்",
        password: "கடவுச்சொல்",
        createElection: "தேர்தல் உருவாக்கவும்",
        electionTitle: "தேர்தல் தலைப்பு",
        description: "விவரம்",
        startTime: "தொடக்க நேரம்",
        endTime: "முடிவு நேரம்",
        candidates: "வேட்பாளர்கள்",
        addCandidate: "வேட்பாளரை சேர்க்கவும்",
        dashboard: "டாஷ்போர்டு",
        elections: "தேர்தல்கள்",
        voters: "வாக்காளர்கள்",
        analytics: "பகுப்பாய்வு",
        auditLog: "தணிக்கை பதிவு",
        settings: "அமைப்புகள்",
        importVoters: "வாக்காளர்களை இறக்குமதி செய்க",
        exportResults: "முடிவுகளை ஏற்றுமதி செய்க",
        manageElections: "தேர்தல்களை நிர்வகிக்கவும்",
        viewResults: "முடிவுகளைக் காண்க",
        electionStatus: "தேர்தல் நிலை",
        pending: "நிலுவையில்",
        active: "செயலில்",
        ended: "முடிந்தது",
        state: "மாநிலம்",
        startDate: "தொடக்க தேதி",
        endDate: "முடிவு தேதி",
        actions: "செயல்கள்",
        view: "காண்க",
        adminLogin: "நிர்வாக உள்நுழைவு",
        adminDashboard: "நிர்வாக டாஷ்போர்டு",
        totalVoters: "மொத்த வாக்காளர்கள்",
        registered: "பதிவு செய்யப்பட்டது",
        uploadCsv: "CSV பதிவேற்றவும்",
        downloadTemplate: "வார்ப்புரு பதிவிறக்கவும்",
        electionDetails: "தேர்தல் விவரங்கள்",
        candidateDetails: "வேட்பாளர் விவரங்கள்",
        uploadPhoto: "புகைப்படத்தை பதிவேற்றவும்",
        uploadLogo: "லோகோவை பதிவேற்றவும்",
        uploadSymbol: "சின்னத்தை பதிவேற்றவும்",
        
        // Quick Actions & Dashboard
        recentElections: "சமீபத்திய தேர்தல்கள்",
        quickActions: "விரைவு செயல்கள்",
        createNewElection: "புதிய தேர்தலை உருவாக்கவும்",
        viewAnalytics: "பகுப்பாய்வைக் காண்க",
        auditLogs: "தணிக்கை பதிவுகள்",
        
        // Create Election Form
        stateForElection: "தேர்தலுக்கான மாநிலம்",
        electionTitlePlaceholder: "எ.கா: மகாராஷ்டிரா பொதுத் தேர்தல் 2025",
        electionDescriptionPlaceholder: "தேர்தல் விவரத்தை உள்ளிடவும்",
        clearForm: "படிவத்தை அழிக்கவும்",
        
        // Import Voters
        importVoterData: "வாக்காளர் தரவை இறக்குமதி செய்க",
        importVoterDescription: "மாநில வாரியான வாக்காளர் தரவுடன் Excel அல்லது CSV கோப்பை பதிவேற்றவும் (ஆதார் எண், பெயர் மற்றும் மாநிலம்)",
        needTemplate: "வார்ப்புரு தேவையா?",
        downloadSampleTemplate: "சரியான வடிவத்துடன் எங்கள் மாதிரி Excel வார்ப்புருவைப் பதிவிறக்கவும்",
        selectOrDropFile: "கோப்பைத் தேர்ந்தெடுக்கவும் அல்லது இங்கே விடவும்",
        supportedFormats: "ஆதரிக்கப்படும் வடிவங்கள்: .xlsx, .xls, .csv (அதிகபட்சம் 10MB)",
        chooseFile: "கோப்பைத் தேர்ந்தெடுக்கவும்",
        importResults: "இறக்குமதி முடிவுகள்",
        
        // Analytics & Audit
        allElections: "அனைத்து தேர்தல்களும்",
        voterTurnoutAnalytics: "வாக்காளர் வருகை பகுப்பாய்வு",
        adminActivityAuditLogs: "நிர்வாக செயல்பாடு தணிக்கை பதிவுகள்",
        refresh: "புதுப்பிக்கவும்",
        auditLogDescription: "வெளிப்படைத்தன்மை மற்றும் பாதுகாப்பிற்காக அனைத்து நிர்வாக செயல்களும் பதிவு செய்யப்படுகின்றன",
        
        // Statistics
        statistics: "புள்ளிவிவரங்கள்",
        voterTurnout: "வாக்காளர் வருகை",
        totalVotes: "மொத்த வாக்குகள்",
        totalElections: "மொத்த தேர்தல்கள்",
        activeElections: "செயலில் உள்ள தேர்தல்கள்",
        participationRate: "பங்கேற்பு விகிதம்",
        stateWiseBreakdown: "மாநில வாரியான விவரங்கள்",
        
        // Candidate
        candidateName: "வேட்பாளர் பெயர்",
        party: "கட்சி",
        symbol: "சின்னம்",
        viewProfile: "சுயவிவரத்தைக் காண்க",
        manifesto: "தேர்தல் அறிக்கை",
        achievements: "சாதனைகள்",
        contactInfo: "தொடர்பு தகவல்",
        
        // Theme
        darkMode: "இருண்ட பயன்முறை",
        lightMode: "ஒளி பயன்முறை",
        
        // Languages
        language: "மொழி",
        english: "ஆங்கிலம்",
        hindi: "இந்தி",
        tamil: "தமிழ்",
        telugu: "தெலுங்கு",
        bengali: "வங்காளம்",
        marathi: "மராத்தி",
        gujarati: "குஜராத்தி",
        kannada: "கன்னடம்"
    },
    
    te: { // Telugu
        // Common
        welcome: "స్వాగతం",
        login: "లాగిన్",
        logout: "లాగ్అవుట్",
        register: "నమోదు",
        submit: "సమర్పించండి",
        cancel: "రద్దు చేయండి",
        save: "సేవ్ చేయండి",
        delete: "తొలగించు",
        edit: "సవరించు",
        back: "వెనుకకు",
        next: "తరువాత",
        loading: "లోడ్ అవుతోంది...",
        error: "లోపం",
        success: "విజయం",
        
        // Voter Portal
        voterPortal: "ఓటరు పోర్టల్",
        voterId: "ఓటరు ID",
        voterToken: "ఓటరు టోకెన్",
        enterVoterId: "మీ ఓటరు IDని నమోదు చేయండి",
        enterVoterToken: "మీ ఓటరు టోకెన్ నమోదు చేయండి",
        voterLogin: "ఓటరు లాగిన్",
        secureVoting: "సురక్షిత బ్లాక్‌చైన్ ఓటింగ్",
        currentElections: "ప్రస్తుత ఎన్నికలు",
        castYourVote: "మీ ఓటు వేయండి",
        selectCandidate: "అభ్యర్థిని ఎంచుకోండి",
        confirmVote: "ఓటును నిర్ధారించండి",
        voteRecorded: "ఓటు విజయవంతంగా నమోదు చేయబడింది",
        alreadyVoted: "మీరు ఇప్పటికే ఓటు వేశారు",
        noElections: "క్రియాశీల ఎన్నికలు అందుబాటులో లేవు",
        selectState: "రాష్ట్రాన్ని ఎంచుకోండి",
        
        // Admin Portal
        adminPortal: "అడ్మిన్ పోర్టల్",
        adminSubtitle: "🎯 ఎన్నికలను నిర్వహించండి, ఓట్లను పర్యవేక్షించండి, పారదర్శకతను నిర్ధారించండి",
        username: "యూజర్ నేమ్",
        password: "పాస్‌వర్డ్",
        createElection: "ఎన్నికను సృష్టించండి",
        electionTitle: "ఎన్నిక శీర్షిక",
        description: "వివరణ",
        startTime: "ప్రారంభ సమయం",
        endTime: "ముగింపు సమయం",
        candidates: "అభ్యర్థులు",
        addCandidate: "అభ్యర్థిని జోడించండి",
        dashboard: "డాష్‌బోర్డ్",
        elections: "ఎన్నికలు",
        voters: "ఓటర్లు",
        analytics: "విశ్లేషణలు",
        auditLog: "ఆడిట్ లాగ్",
        settings: "సెట్టింగ్‌లు",
        importVoters: "ఓటర్లను దిగుమతి చేయండి",
        exportResults: "ఫలితాలను ఎగుమతి చేయండి",
        manageElections: "ఎన్నికలను నిర్వహించండి",
        viewResults: "ఫలితాలను చూడండి",
        electionStatus: "ఎన్నిక స్థితి",
        pending: "పెండింగ్",
        active: "క్రియాశీలం",
        ended: "ముగిసింది",
        state: "రాష్ట్రం",
        startDate: "ప్రారంభ తేదీ",
        endDate: "ముగింపు తేదీ",
        actions: "చర్యలు",
        view: "చూడండి",
        adminLogin: "అడ్మిన్ లాగిన్",
        adminDashboard: "అడ్మిన్ డాష్‌బోర్డ్",
        totalVoters: "మొత్తం ఓటర్లు",
        registered: "నమోదు చేయబడింది",
        uploadCsv: "CSV అప్‌లోడ్ చేయండి",
        downloadTemplate: "టెంప్లేట్ డౌన్‌లోడ్ చేయండి",
        electionDetails: "ఎన్నిక వివరాలు",
        candidateDetails: "అభ్యర్థి వివరాలు",
        uploadPhoto: "ఫోటో అప్‌లోడ్ చేయండి",
        uploadLogo: "లోగో అప్‌లోడ్ చేయండి",
        uploadSymbol: "చిహ్నం అప్‌లోడ్ చేయండి",
        
        // Statistics
        statistics: "గణాంకాలు",
        voterTurnout: "ఓటరు హాజరు",
        totalVotes: "మొత్తం ఓట్లు",
        totalElections: "మొత్తం ఎన్నికలు",
        activeElections: "క్రియాశీల ఎన్నికలు",
        participationRate: "పాల్గొనడం రేటు",
        stateWiseBreakdown: "రాష్ట్ర వారీగా వివరాలు",
        
        // Candidate
        candidateName: "అభ్యర్థి పేరు",
        party: "పార్టీ",
        symbol: "చిహ్నం",
        viewProfile: "ప్రొఫైల్ చూడండి",
        manifesto: "ప్రకటన పత్రం",
        achievements: "విజయాలు",
        contactInfo: "సంప్రదింపు సమాచారం",
        
        // Theme
        darkMode: "డార్క్ మోడ్",
        lightMode: "లైట్ మోడ్",
        
        // Languages
        language: "భాష",
        english: "ఆంగ్లం",
        hindi: "హిందీ",
        tamil: "తమిళం",
        telugu: "తెలుగు",
        bengali: "బెంగాలీ",
        marathi: "మరాఠీ",
        gujarati: "గుజరాతీ",
        kannada: "కన్నడ"
    },
    
    bn: { // Bengali
        // Common
        welcome: "স্বাগতম",
        login: "লগইন",
        logout: "লগআউট",
        register: "নিবন্ধন",
        submit: "জমা দিন",
        cancel: "বাতিল",
        save: "সংরক্ষণ",
        delete: "মুছুন",
        edit: "সম্পাদনা",
        back: "পিছনে",
        next: "পরবর্তী",
        loading: "লোড হচ্ছে...",
        error: "ত্রুটি",
        success: "সফলতা",
        
        // Voter Portal
        voterPortal: "ভোটার পোর্টাল",
        voterId: "ভোটার আইডি",
        voterToken: "ভোটার টোকেন",
        enterVoterId: "আপনার ভোটার আইডি লিখুন",
        enterVoterToken: "আপনার ভোটার টোকেন লিখুন",
        voterLogin: "ভোটার লগইন",
        secureVoting: "নিরাপদ ব্লকচেইন ভোটিং",
        currentElections: "বর্তমান নির্বাচন",
        castYourVote: "আপনার ভোট দিন",
        selectCandidate: "প্রার্থী নির্বাচন করুন",
        confirmVote: "ভোট নিশ্চিত করুন",
        voteRecorded: "ভোট সফলভাবে রেকর্ড করা হয়েছে",
        alreadyVoted: "আপনি ইতিমধ্যে ভোট দিয়েছেন",
        noElections: "কোনো সক্রিয় নির্বাচন নেই",
        selectState: "রাজ্য নির্বাচন করুন",
        
        // Admin Portal
        adminPortal: "অ্যাডমিন পোর্টাল",
        adminSubtitle: "🎯 নির্বাচন পরিচালনা করুন, ভোট নিরীক্ষণ করুন, স্বচ্ছতা নিশ্চিত করুন",
        username: "ব্যবহারকারীর নাম",
        password: "পাসওয়ার্ড",
        createElection: "নির্বাচন তৈরি করুন",
        electionTitle: "নির্বাচনের শিরোনাম",
        description: "বর্ণনা",
        startTime: "শুরুর সময়",
        endTime: "শেষ সময়",
        candidates: "প্রার্থীরা",
        addCandidate: "প্রার্থী যোগ করুন",
        dashboard: "ড্যাশবোর্ড",
        elections: "নির্বাচন",
        voters: "ভোটার",
        analytics: "বিশ্লেষণ",
        auditLog: "অডিট লগ",
        settings: "সেটিংস",
        importVoters: "ভোটার আমদানি করুন",
        exportResults: "ফলাফল রপ্তানি করুন",
        manageElections: "নির্বাচন পরিচালনা করুন",
        viewResults: "ফলাফল দেখুন",
        electionStatus: "নির্বাচনের অবস্থা",
        pending: "মুলতুবি",
        active: "সক্রিয়",
        ended: "শেষ হয়েছে",
        state: "রাজ্য",
        startDate: "শুরুর তারিখ",
        endDate: "শেষ তারিখ",
        actions: "কর্ম",
        view: "দেখুন",
        adminLogin: "অ্যাডমিন লগইন",
        adminDashboard: "অ্যাডমিন ড্যাশবোর্ড",
        totalVoters: "মোট ভোটার",
        registered: "নিবন্ধিত",
        uploadCsv: "CSV আপলোড করুন",
        downloadTemplate: "টেমপ্লেট ডাউনলোড করুন",
        electionDetails: "নির্বাচনের বিবরণ",
        candidateDetails: "প্রার্থীর বিবরণ",
        uploadPhoto: "ফটো আপলোড করুন",
        uploadLogo: "লোগো আপলোড করুন",
        uploadSymbol: "প্রতীক আপলোড করুন",
        
        // Statistics
        statistics: "পরিসংখ্যান",
        voterTurnout: "ভোটার উপস্থিতি",
        totalVotes: "মোট ভোট",
        totalElections: "মোট নির্বাচন",
        activeElections: "সক্রিয় নির্বাচন",
        participationRate: "অংশগ্রহণের হার",
        stateWiseBreakdown: "রাজ্য অনুযায়ী বিবরণ",
        
        // Candidate
        candidateName: "প্রার্থীর নাম",
        party: "দল",
        symbol: "প্রতীক",
        viewProfile: "প্রোফাইল দেখুন",
        manifesto: "ইশতেহার",
        achievements: "অর্জন",
        contactInfo: "যোগাযোগের তথ্য",
        
        // Theme
        darkMode: "ডার্ক মোড",
        lightMode: "লাইট মোড",
        
        // Languages
        language: "ভাষা",
        english: "ইংরেজি",
        hindi: "হিন্দি",
        tamil: "তামিল",
        telugu: "তেলুগু",
        bengali: "বাংলা",
        marathi: "মারাঠি",
        gujarati: "গুজরাটি",
        kannada: "কন্নড"
    },
    
    mr: { // Marathi
        // Common
        welcome: "स्वागत आहे",
        login: "लॉगिन",
        logout: "लॉगआउट",
        register: "नोंदणी",
        submit: "सबमिट करा",
        cancel: "रद्द करा",
        save: "जतन करा",
        delete: "हटवा",
        edit: "संपादित करा",
        back: "मागे",
        next: "पुढे",
        loading: "लोड होत आहे...",
        error: "त्रुटी",
        success: "यश",
        
        // Voter Portal
        voterPortal: "मतदार पोर्टल",
        voterId: "मतदार आयडी",
        voterToken: "मतदार टोकन",
        enterVoterId: "तुमचा मतदार आयडी प्रविष्ट करा",
        enterVoterToken: "तुमचा मतदार टोकन प्रविष्ट करा",
        voterLogin: "मतदार लॉगिन",
        secureVoting: "सुरक्षित ब्लॉकचेन मतदान",
        currentElections: "सध्याच्या निवडणुका",
        castYourVote: "तुमचे मत द्या",
        selectCandidate: "उमेदवार निवडा",
        confirmVote: "मत पुष्टी करा",
        voteRecorded: "मत यशस्वीरित्या नोंदवले गेले",
        alreadyVoted: "तुम्ही आधीच मतदान केले आहे",
        noElections: "कोणत्याही सक्रिय निवडणुका उपलब्ध नाहीत",
        selectState: "राज्य निवडा",
        
        // Admin Portal
        adminPortal: "प्रशासक पोर्टल",
        adminSubtitle: "🎯 निवडणुका व्यवस्थापित करा, मते मॉनिटर करा, पारदर्शकता सुनिश्चित करा",
        username: "वापरकर्तानाव",
        password: "पासवर्ड",
        createElection: "निवडणूक तयार करा",
        electionTitle: "निवडणुकीचे शीर्षक",
        description: "वर्णन",
        startTime: "सुरुवात वेळ",
        endTime: "समाप्ती वेळ",
        candidates: "उमेदवार",
        addCandidate: "उमेदवार जोडा",
        dashboard: "डॅशबोर्ड",
        elections: "निवडणुका",
        voters: "मतदार",
        analytics: "विश्लेषण",
        auditLog: "ऑडिट लॉग",
        settings: "सेटिंग्ज",
        importVoters: "मतदार आयात करा",
        exportResults: "निकाल निर्यात करा",
        manageElections: "निवडणुका व्यवस्थापित करा",
        viewResults: "निकाल पहा",
        electionStatus: "निवडणूक स्थिती",
        pending: "प्रलंबित",
        active: "सक्रिय",
        ended: "समाप्त",
        state: "राज्य",
        startDate: "सुरुवात तारीख",
        endDate: "समाप्ती तारीख",
        actions: "क्रिया",
        view: "पहा",
        adminLogin: "प्रशासक लॉगिन",
        adminDashboard: "प्रशासक डॅशबोर्ड",
        totalVoters: "एकूण मतदार",
        registered: "नोंदणीकृत",
        uploadCsv: "CSV अपलोड करा",
        downloadTemplate: "टेम्पलेट डाउनलोड करा",
        electionDetails: "निवडणूक तपशील",
        candidateDetails: "उमेदवार तपशील",
        uploadPhoto: "फोटो अपलोड करा",
        uploadLogo: "लोगो अपलोड करा",
        uploadSymbol: "चिन्ह अपलोड करा",
        
        // Statistics
        statistics: "आकडेवारी",
        voterTurnout: "मतदार उपस्थिती",
        totalVotes: "एकूण मते",
        totalElections: "एकूण निवडणुका",
        activeElections: "सक्रिय निवडणुका",
        participationRate: "सहभाग दर",
        stateWiseBreakdown: "राज्यानुसार तपशील",
        
        // Candidate
        candidateName: "उमेदवाराचे नाव",
        party: "पक्ष",
        symbol: "चिन्ह",
        viewProfile: "प्रोफाइल पहा",
        manifesto: "जाहीरनामा",
        achievements: "उपलब्धी",
        contactInfo: "संपर्क माहिती",
        
        // Theme
        darkMode: "डार्क मोड",
        lightMode: "लाइट मोड",
        
        // Languages
        language: "भाषा",
        english: "इंग्रजी",
        hindi: "हिंदी",
        tamil: "तमिळ",
        telugu: "तेलुगू",
        bengali: "बंगाली",
        marathi: "मराठी",
        gujarati: "गुजराती",
        kannada: "कन्नड"
    },
    
    gu: { // Gujarati
        // Common
        welcome: "સ્વાગત છે",
        login: "લોગિન",
        logout: "લૉગઆઉટ",
        register: "નોંધણી",
        submit: "સબમિટ કરો",
        cancel: "રદ કરો",
        save: "સાચવો",
        delete: "કાઢી નાખો",
        edit: "સંપાદિત કરો",
        back: "પાછળ",
        next: "આગળ",
        loading: "લોડ થઈ રહ્યું છે...",
        error: "ભૂલ",
        success: "સફળતા",
        
        // Voter Portal
        voterPortal: "મતદાર પોર્ટલ",
        voterSubtitle: "✅ સુરક્ષિત રીતે નોંધણી કરો, મતદાન કરો અને ચકાસણી કરો",
        voterId: "મતદાર ID",
        voterToken: "મતદાર ટોકન",
        enterVoterId: "તમારું મતદાર ID દાખલ કરો",
        enterVoterToken: "તમારું મતદાર ટોકન દાખલ કરો",
        voterLogin: "મતદાર લોગિન",
        secureVoting: "સુરક્ષિત બ્લોકચેન મતદાન",
        currentElections: "વર્તમાન ચૂંટણીઓ",
        castYourVote: "તમારો મત નાખો",
        selectCandidate: "ઉમેદવાર પસંદ કરો",
        confirmVote: "મતની પુષ્ટિ કરો",
        voteRecorded: "મત સફળતાપૂર્વક નોંધાયો",
        alreadyVoted: "તમે પહેલેથી જ મતદાન કર્યું છે",
        noElections: "કોઈ સક્રિય ચૂંટણી ઉપલબ્ધ નથી",
        selectState: "રાજ્ય પસંદ કરો",
        voterRegistration: "મતદાર નોંધણી",
        selectYourState: "તમારું રાજ્ય પસંદ કરો *",
        aadhaarNumber: "આધાર નંબર (12 અંક) *",
        enterAadhaar: "આધાર નંબર દાખલ કરો",
        requestOtp: "OTP વિનંતી કરો",
        enterOtp: "OTP દાખલ કરો",
        enter6DigitOtp: "6 અંકનો OTP દાખલ કરો",
        completeRegistration: "નોંધણી પૂર્ણ કરો",
        
        // Admin Portal
        adminPortal: "એડમિન પોર્ટલ",
        adminSubtitle: "🎯 ચૂંટણીઓનું સંચાલન કરો, મતોની દેખરેખ રાખો અને પારદર્શિતા સુનિશ્ચિત કરો",
        username: "વપરાશકર્તા નામ",
        password: "પાસવર્ડ",
        createElection: "ચૂંટણી બનાવો",
        electionTitle: "ચૂંટણીનું શીર્ષક",
        description: "વર્ણન",
        startTime: "પ્રારંભ સમય",
        endTime: "સમાપ્તિ સમય",
        candidates: "ઉમેદવારો",
        addCandidate: "ઉમેદવાર ઉમેરો",
        dashboard: "ડેશબોર્ડ",
        elections: "ચૂંટણીઓ",
        voters: "મતદારો",
        analytics: "વિશ્લેષણ",
        auditLog: "ઑડિટ લોગ",
        settings: "સેટિંગ્સ",
        importVoters: "મતદારો આયાત કરો",
        exportResults: "પરિણામો નિકાસ કરો",
        manageElections: "ચૂંટણીઓ વ્યવસ્થિત કરો",
        viewResults: "પરિણામો જુઓ",
        electionStatus: "ચૂંટણી સ્થિતિ",
        pending: "બાકી",
        active: "સક્રિય",
        ended: "સમાપ્ત",
        state: "રાજ્ય",
        startDate: "પ્રારંભ તારીખ",
        endDate: "સમાપ્તિ તારીખ",
        actions: "ક્રિયાઓ",
        view: "જુઓ",
        adminLogin: "એડમિન લોગિન",
        adminDashboard: "એડમિન ડેશબોર્ડ",
        totalVoters: "કુલ મતદારો",
        registered: "નોંધાયેલ",
        uploadCsv: "CSV અપલોડ કરો",
        downloadTemplate: "ટેમ્પ્લેટ ડાઉનલોડ કરો",
        electionDetails: "ચૂંટણી વિગતો",
        candidateDetails: "ઉમેદવાર વિગતો",
        uploadPhoto: "ફોટો અપલોડ કરો",
        uploadLogo: "લોગો અપલોડ કરો",
        uploadSymbol: "પ્રતીક અપલોડ કરો",
        
        // Statistics
        statistics: "આંકડા",
        voterTurnout: "મતદાર હાજરી",
        totalVotes: "કુલ મતો",
        totalElections: "કુલ ચૂંટણીઓ",
        activeElections: "સક્રિય ચૂંટણીઓ",
        participationRate: "ભાગીદારી દર",
        stateWiseBreakdown: "રાજ્ય પ્રમાણે વિગતો",
        
        // Candidate
        candidateName: "ઉમેદવારનું નામ",
        party: "પક્ષ",
        symbol: "પ્રતીક",
        viewProfile: "પ્રોફાઇલ જુઓ",
        manifesto: "ઘોષણાપત્ર",
        achievements: "સિદ્ધિઓ",
        contactInfo: "સંપર્ક માહિતી",
        
        // Theme
        darkMode: "ડાર્ક મોડ",
        lightMode: "લાઇટ મોડ",
        
        // Languages
        language: "ભાષા",
        english: "અંગ્રેજી",
        hindi: "હિન્દી",
        tamil: "તમિલ",
        telugu: "તેલુગુ",
        bengali: "બંગાળી",
        marathi: "મરાઠી",
        gujarati: "ગુજરાતી",
        kannada: "કન્નડ"
    },
    
    kn: { // Kannada
        // Common
        welcome: "ಸ್ವಾಗತ",
        login: "ಲಾಗಿನ್",
        logout: "ಲಾಗ್ಔಟ್",
        register: "ನೋಂದಣಿ",
        submit: "ಸಲ್ಲಿಸು",
        cancel: "ರದ್ದುಮಾಡು",
        save: "ಉಳಿಸು",
        delete: "ಅಳಿಸು",
        edit: "ಸಂಪಾದಿಸು",
        back: "ಹಿಂದೆ",
        next: "ಮುಂದೆ",
        loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        error: "ದೋಷ",
        success: "ಯಶಸ್ಸು",
        
        // Voter Portal
        voterPortal: "ಮತದಾರ ಪೋರ್ಟಲ್",
        voterSubtitle: "✅ ಸುರಕ್ಷಿತವಾಗಿ ನೋಂದಾಯಿಸಿ, ಮತ ಚಲಾಯಿಸಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ",
        voterId: "ಮತದಾರ ID",
        voterToken: "ಮತದಾರ ಟೋಕನ್",
        enterVoterId: "ನಿಮ್ಮ ಮತದಾರ ID ನಮೂದಿಸಿ",
        enterVoterToken: "ನಿಮ್ಮ ಮತದಾರ ಟೋಕನ್ ನಮೂದಿಸಿ",
        voterLogin: "ಮತದಾರ ಲಾಗಿನ್",
        secureVoting: "ಸುರಕ್ಷಿತ ಬ್ಲಾಕ್‌ಚೈನ್ ಮತದಾನ",
        currentElections: "ಪ್ರಸ್ತುತ ಚುನಾವಣೆಗಳು",
        castYourVote: "ನಿಮ್ಮ ಮತ ಚಲಾಯಿಸಿ",
        selectCandidate: "ಅಭ್ಯರ್ಥಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        confirmVote: "ಮತವನ್ನು ದೃಢೀಕರಿಸಿ",
        voteRecorded: "ಮತವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ",
        alreadyVoted: "ನೀವು ಈಗಾಗಲೇ ಮತ ಚಲಾಯಿಸಿದ್ದೀರಿ",
        noElections: "ಯಾವುದೇ ಸಕ್ರಿಯ ಚುನಾವಣೆಗಳು ಲಭ್ಯವಿಲ್ಲ",
        selectState: "ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        voterRegistration: "ಮತದಾರ ನೋಂದಣಿ",
        selectYourState: "ನಿಮ್ಮ ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ *",
        aadhaarNumber: "ಆಧಾರ್ ಸಂಖ್ಯೆ (12 ಅಂಕೆಗಳು) *",
        enterAadhaar: "ಆಧಾರ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
        requestOtp: "OTP ವಿನಂತಿಸಿ",
        enterOtp: "OTP ನಮೂದಿಸಿ",
        enter6DigitOtp: "6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ",
        completeRegistration: "ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ",
        
        // Admin Portal
        adminPortal: "ನಿರ್ವಾಹಕ ಪೋರ್ಟಲ್",
        adminSubtitle: "🎯 ಚುನಾವಣೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ, ಮತಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಮತ್ತು ಪಾರದರ್ಶಕತೆಯನ್ನು ಖಾತ್ರಿಪಡಿಸಿ",
        username: "ಬಳಕೆದಾರ ಹೆಸರು",
        password: "ಪಾಸ್‌ವರ್ಡ್",
        createElection: "ಚುನಾವಣೆ ರಚಿಸಿ",
        electionTitle: "ಚುನಾವಣೆ ಶೀರ್ಷಿಕೆ",
        description: "ವಿವರಣೆ",
        startTime: "ಪ್ರಾರಂಭ ಸಮಯ",
        endTime: "ಅಂತಿಮ ಸಮಯ",
        candidates: "ಅಭ್ಯರ್ಥಿಗಳು",
        addCandidate: "ಅಭ್ಯರ್ಥಿಯನ್ನು ಸೇರಿಸಿ",
        
        // Statistics
        statistics: "ಅಂಕಿಅಂಶಗಳು",
        voterTurnout: "ಮತದಾರರ ಹಾಜರಾತಿ",
        totalVotes: "ಒಟ್ಟು ಮತಗಳು",
        totalElections: "ಒಟ್ಟು ಚುನಾವಣೆಗಳು",
        activeElections: "ಸಕ್ರಿಯ ಚುನಾವಣೆಗಳು",
        participationRate: "ಭಾಗವಹಿಸುವಿಕೆ ದರ",
        stateWiseBreakdown: "ರಾಜ್ಯ ಪ್ರಕಾರ ವಿವರಗಳು",
        
        // Candidate
        candidateName: "ಅಭ್ಯರ್ಥಿ ಹೆಸರು",
        party: "ಪಕ್ಷ",
        symbol: "ಚಿಹ್ನೆ",
        viewProfile: "ಪ್ರೊಫೈಲ್ ನೋಡಿ",
        manifesto: "ಪ್ರಣಾಳಿಕೆ",
        achievements: "ಸಾಧನೆಗಳು",
        contactInfo: "ಸಂಪರ್ಕ ಮಾಹಿತಿ",
        
        // Theme
        darkMode: "ಡಾರ್ಕ್ ಮೋಡ್",
        lightMode: "ಲೈಟ್ ಮೋಡ್",
        
        // Languages
        language: "ಭಾಷೆ",
        english: "ಇಂಗ್ಲಿಷ್",
        hindi: "ಹಿಂದಿ",
        tamil: "ತಮಿಳು",
        telugu: "ತೆಲುಗು",
        bengali: "ಬಂಗಾಳಿ",
        marathi: "ಮರಾಠಿ",
        gujarati: "ಗುಜರಾತಿ",
        kannada: "ಕನ್ನಡ"
    },
    
    ml: { // Malayalam
        // Common
        welcome: "സ്വാഗതം",
        login: "ലോഗിൻ",
        logout: "ലോഗൗട്ട്",
        register: "രജിസ്റ്റർ",
        submit: "സമർപ്പിക്കുക",
        cancel: "റദ്ദാക്കുക",
        save: "സംരക്ഷിക്കുക",
        delete: "ഇല്ലാതാക്കുക",
        edit: "എഡിറ്റ് ചെയ്യുക",
        back: "പുറകോട്ട്",
        next: "അടുത്തത്",
        loading: "ലോഡ് ചെയ്യുന്നു...",
        error: "പിശക്",
        success: "വിജയം",
        
        // Voter Portal
        voterPortal: "വോട്ടർ പോർട്ടൽ",
        voterSubtitle: "✅ സുരക്ഷിതമായി രജിസ്റ്റർ ചെയ്യുക, വോട്ട് ചെയ്യുക, സ്ഥിരീകരിക്കുക",
        voterId: "വോട്ടർ ID",
        voterToken: "വോട്ടർ ടോക്കൺ",
        enterVoterId: "നിങ്ങളുടെ വോട്ടർ ID നൽകുക",
        enterVoterToken: "നിങ്ങളുടെ വോട്ടർ ടോക്കൺ നൽകുക",
        voterLogin: "വോട്ടർ ലോഗിൻ",
        secureVoting: "സുരക്ഷിത ബ്ലോക്ക്ചെയിൻ വോട്ടിംഗ്",
        currentElections: "നിലവിലെ തിരഞ്ഞെടുപ്പുകൾ",
        castYourVote: "നിങ്ങളുടെ വോട്ട് രേഖപ്പെടുത്തുക",
        selectCandidate: "സ്ഥാനാർത്ഥി തിരഞ്ഞെടുക്കുക",
        confirmVote: "വോട്ട് സ്ഥിരീകരിക്കുക",
        voteRecorded: "വോട്ട് വിജയകരമായി രേഖപ്പെടുത്തി",
        alreadyVoted: "നിങ്ങൾ ഇതിനകം വോട്ട് ചെയ്തിട്ടുണ്ട്",
        noElections: "സജീവമായ തിരഞ്ഞെടുപ്പുകൾ ലഭ്യമല്ല",
        selectState: "സംസ്ഥാനം തിരഞ്ഞെടുക്കുക",
        voterRegistration: "വോട്ടർ രജിസ്ട്രേഷൻ",
        selectYourState: "നിങ്ങളുടെ സംസ്ഥാനം തിരഞ്ഞെടുക്കുക *",
        aadhaarNumber: "ആധാർ നമ്പർ (12 അക്കങ്ങൾ) *",
        enterAadhaar: "ആധാർ നമ്പർ നൽകുക",
        requestOtp: "OTP അഭ്യർത്ഥിക്കുക",
        enterOtp: "OTP നൽകുക",
        enter6DigitOtp: "6 അക്ക OTP നൽകുക",
        completeRegistration: "രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക",
        
        // Admin Portal
        adminPortal: "അഡ്മിൻ പോർട്ടൽ",
        adminSubtitle: "🎯 തിരഞ്ഞെടുപ്പുകൾ നിയന്ത്രിക്കുക, വോട്ടുകൾ നിരീക്ഷിക്കുക, സുതാര്യത ഉറപ്പാക്കുക",
        username: "ഉപയോക്തൃനാമം",
        password: "പാസ്‌വേഡ്",
        createElection: "തിരഞ്ഞെടുപ്പ് സൃഷ്ടിക്കുക",
        electionTitle: "തിരഞ്ഞെടുപ്പ് ശീർഷകം",
        description: "വിവരണം",
        startTime: "ആരംഭ സമയം",
        endTime: "അവസാന സമയം",
        candidates: "സ്ഥാനാർത്ഥികൾ",
        addCandidate: "സ്ഥാനാർത്ഥി ചേർക്കുക",
        
        // Statistics
        statistics: "സ്ഥിതിവിവരക്കണക്കുകൾ",
        voterTurnout: "വോട്ടർ പങ്കാളിത്തം",
        totalVotes: "മൊത്തം വോട്ടുകൾ",
        totalElections: "മൊത്തം തിരഞ്ഞെടുപ്പുകൾ",
        activeElections: "സജീവ തിരഞ്ഞെടുപ്പുകൾ",
        participationRate: "പങ്കാളിത്ത നിരക്ക്",
        stateWiseBreakdown: "സംസ്ഥാന തിരിച്ചുള്ള വിശദാംശങ്ങൾ",
        
        // Candidate
        candidateName: "സ്ഥാനാർത്ഥി പേര്",
        party: "പാർട്ടി",
        symbol: "ചിഹ്നം",
        viewProfile: "പ്രൊഫൈൽ കാണുക",
        manifesto: "പ്രകടന പത്രിക",
        achievements: "നേട്ടങ്ങൾ",
        contactInfo: "ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ",
        
        // Theme
        darkMode: "ഡാർക്ക് മോഡ്",
        lightMode: "ലൈറ്റ് മോഡ്",
        
        // Languages
        language: "ഭാഷ",
        english: "ഇംഗ്ലീഷ്",
        hindi: "ഹിന്ദി",
        tamil: "തമിഴ്",
        telugu: "തെലുങ്ക്",
        bengali: "ബംഗാളി",
        marathi: "മറാത്തി",
        gujarati: "ഗുജറാത്തി",
        kannada: "കന്നഡ"
    },
    
    pa: { // Punjabi
        // Common
        welcome: "ਸੁਆਗਤ ਹੈ",
        login: "ਲੌਗਿਨ",
        logout: "ਲੌਗਆਊਟ",
        register: "ਰਜਿਸਟਰ",
        submit: "ਜਮ੍ਹਾਂ ਕਰੋ",
        cancel: "ਰੱਦ ਕਰੋ",
        save: "ਸੇਵ ਕਰੋ",
        delete: "ਮਿਟਾਓ",
        edit: "ਸੰਪਾਦਿਤ ਕਰੋ",
        back: "ਪਿੱਛੇ",
        next: "ਅੱਗੇ",
        loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
        error: "ਗਲਤੀ",
        success: "ਸਫਲਤਾ",
        
        // Voter Portal
        voterPortal: "ਵੋਟਰ ਪੋਰਟਲ",
        voterSubtitle: "✅ ਸੁਰੱਖਿਅਤ ਰੂਪ ਵਿੱਚ ਰਜਿਸਟਰ ਕਰੋ, ਵੋਟ ਪਾਓ ਅਤੇ ਪੁਸ਼ਟੀ ਕਰੋ",
        voterId: "ਵੋਟਰ ID",
        voterToken: "ਵੋਟਰ ਟੋਕਨ",
        enterVoterId: "ਆਪਣੀ ਵੋਟਰ ID ਦਾਖਲ ਕਰੋ",
        enterVoterToken: "ਆਪਣਾ ਵੋਟਰ ਟੋਕਨ ਦਾਖਲ ਕਰੋ",
        voterLogin: "ਵੋਟਰ ਲੌਗਿਨ",
        secureVoting: "ਸੁਰੱਖਿਅਤ ਬਲਾਕਚੇਨ ਵੋਟਿੰਗ",
        currentElections: "ਮੌਜੂਦਾ ਚੋਣਾਂ",
        castYourVote: "ਆਪਣੀ ਵੋਟ ਪਾਓ",
        selectCandidate: "ਉਮੀਦਵਾਰ ਚੁਣੋ",
        confirmVote: "ਵੋਟ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
        voteRecorded: "ਵੋਟ ਸਫਲਤਾਪੂਰਵਕ ਰਿਕਾਰਡ ਕੀਤੀ ਗਈ",
        alreadyVoted: "ਤੁਸੀਂ ਪਹਿਲਾਂ ਹੀ ਵੋਟ ਪਾ ਚੁੱਕੇ ਹੋ",
        noElections: "ਕੋਈ ਸਰਗਰਮ ਚੋਣ ਉਪਲਬਧ ਨਹੀਂ",
        selectState: "ਰਾਜ ਚੁਣੋ",
        voterRegistration: "ਵੋਟਰ ਰਜਿਸਟ੍ਰੇਸ਼ਨ",
        selectYourState: "ਆਪਣਾ ਰਾਜ ਚੁਣੋ *",
        aadhaarNumber: "ਆਧਾਰ ਨੰਬਰ (12 ਅੰਕ) *",
        enterAadhaar: "ਆਧਾਰ ਨੰਬਰ ਦਾਖਲ ਕਰੋ",
        requestOtp: "OTP ਮੰਗੋ",
        enterOtp: "OTP ਦਾਖਲ ਕਰੋ",
        enter6DigitOtp: "6 ਅੰਕਾਂ ਦਾ OTP ਦਾਖਲ ਕਰੋ",
        completeRegistration: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਪੂਰੀ ਕਰੋ",
        
        // Admin Portal
        adminPortal: "ਐਡਮਿਨ ਪੋਰਟਲ",
        adminSubtitle: "🎯 ਚੋਣਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ, ਵੋਟਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ, ਪਾਰਦਰਸ਼ਤਾ ਯਕੀਨੀ ਬਣਾਓ",
        username: "ਯੂਜ਼ਰਨੇਮ",
        password: "ਪਾਸਵਰਡ",
        createElection: "ਚੋਣ ਬਣਾਓ",
        electionTitle: "ਚੋਣ ਦਾ ਸਿਰਲੇਖ",
        description: "ਵੇਰਵਾ",
        startTime: "ਸ਼ੁਰੂਆਤ ਸਮਾਂ",
        endTime: "ਸਮਾਪਤੀ ਸਮਾਂ",
        candidates: "ਉਮੀਦਵਾਰ",
        addCandidate: "ਉਮੀਦਵਾਰ ਸ਼ਾਮਲ ਕਰੋ",
        
        // Statistics
        statistics: "ਅੰਕੜੇ",
        voterTurnout: "ਵੋਟਰ ਹਾਜ਼ਰੀ",
        totalVotes: "ਕੁੱਲ ਵੋਟਾਂ",
        totalElections: "ਕੁੱਲ ਚੋਣਾਂ",
        activeElections: "ਸਰਗਰਮ ਚੋਣਾਂ",
        participationRate: "ਭਾਗੀਦਾਰੀ ਦਰ",
        stateWiseBreakdown: "ਰਾਜ ਅਨੁਸਾਰ ਵੇਰਵਾ",
        
        // Candidate
        candidateName: "ਉਮੀਦਵਾਰ ਦਾ ਨਾਮ",
        party: "ਪਾਰਟੀ",
        symbol: "ਨਿਸ਼ਾਨ",
        viewProfile: "ਪ੍ਰੋਫਾਈਲ ਦੇਖੋ",
        manifesto: "ਘੋਸ਼ਣਾ ਪੱਤਰ",
        achievements: "ਉਪਲਬਧੀਆਂ",
        contactInfo: "ਸੰਪਰਕ ਜਾਣਕਾਰੀ",
        
        // Theme
        darkMode: "ਡਾਰਕ ਮੋਡ",
        lightMode: "ਲਾਈਟ ਮੋਡ",
        
        // Languages
        language: "ਭਾਸ਼ਾ",
        english: "ਅੰਗਰੇਜ਼ੀ",
        hindi: "ਹਿੰਦੀ",
        tamil: "ਤਮਿਲ",
        telugu: "ਤੇਲਗੂ",
        bengali: "ਬੰਗਾਲੀ",
        marathi: "ਮਰਾਠੀ",
        gujarati: "ਗੁਜਰਾਤੀ",
        kannada: "ਕੰਨੜ"
    },
    
    as: { // Assamese
        // Common
        welcome: "স্বাগতম",
        login: "লগইন",
        logout: "লগআউট",
        register: "পঞ্জীয়ন",
        submit: "দাখিল কৰক",
        cancel: "বাতিল",
        save: "সংৰক্ষণ",
        delete: "মচক",
        edit: "সম্পাদনা",
        back: "পিছলৈ",
        next: "পৰৱৰ্তী",
        loading: "ল'ড হৈ আছে...",
        error: "ত্ৰুটি",
        success: "সফলতা",
        
        // Voter Portal
        voterPortal: "ভোটাৰ পৰ্টেল",
        voterSubtitle: "✅ সুৰক্ষিতভাৱে পঞ্জীয়ন কৰক, ভোট দিয়ক আৰু সত্যাপন কৰক",
        voterId: "ভোটাৰ ID",
        voterToken: "ভোটাৰ টোকেন",
        enterVoterId: "আপোনাৰ ভোটাৰ ID দিয়ক",
        enterVoterToken: "আপোনাৰ ভোটাৰ টোকেন দিয়ক",
        voterLogin: "ভোটাৰ লগইন",
        secureVoting: "সুৰক্ষিত ব্লকচে'ন ভোটিং",
        currentElections: "বৰ্তমান নিৰ্বাচন",
        castYourVote: "আপোনাৰ ভোট দিয়ক",
        selectCandidate: "প্ৰাৰ্থী নিৰ্বাচন কৰক",
        confirmVote: "ভোট নিশ্চিত কৰক",
        voteRecorded: "ভোট সফলতাৰে ৰেকৰ্ড কৰা হৈছে",
        alreadyVoted: "আপুনি ইতিমধ্যে ভোট দিছে",
        noElections: "কোনো সক্ৰিয় নিৰ্বাচন উপলব্ধ নাই",
        selectState: "ৰাজ্য নিৰ্বাচন কৰক",
        voterRegistration: "ভোটাৰ পঞ্জীয়ন",
        selectYourState: "আপোনাৰ ৰাজ্য নিৰ্বাচন কৰক *",
        aadhaarNumber: "আধাৰ সংখ্যা (12 সংখ্যা) *",
        enterAadhaar: "আধাৰ সংখ্যা দিয়ক",
        requestOtp: "OTP অনুৰোধ কৰক",
        enterOtp: "OTP দিয়ক",
        enter6DigitOtp: "6 সংখ্যাৰ OTP দিয়ক",
        completeRegistration: "পঞ্জীয়ন সম্পূৰ্ণ কৰক",
        
        // Admin Portal
        adminPortal: "প্ৰশাসক পৰ্টেল",
        adminSubtitle: "🎯 নিৰ্বাচন পৰিচালনা কৰক, ভোট নিৰীক্ষণ কৰক, স্বচ্ছতা নিশ্চিত কৰক",
        username: "ব্যৱহাৰকাৰী নাম",
        password: "পাছৱৰ্ড",
        createElection: "নিৰ্বাচন সৃষ্টি কৰক",
        electionTitle: "নিৰ্বাচনৰ শিৰোনাম",
        description: "বৰ্ণনা",
        startTime: "আৰম্ভ সময়",
        endTime: "সমাপ্তি সময়",
        candidates: "প্ৰাৰ্থীসকল",
        addCandidate: "প্ৰাৰ্থী যোগ দিয়ক",
        
        // Statistics
        statistics: "পৰিসংখ্যা",
        voterTurnout: "ভোটাৰ উপস্থিতি",
        totalVotes: "মুঠ ভোট",
        totalElections: "মুঠ নিৰ্বাচন",
        activeElections: "সক্ৰিয় নিৰ্বাচন",
        participationRate: "অংশগ্ৰহণৰ হাৰ",
        stateWiseBreakdown: "ৰাজ্য অনুসৰি বিৱৰণ",
        
        // Candidate
        candidateName: "প্ৰাৰ্থীৰ নাম",
        party: "দল",
        symbol: "প্ৰতীক",
        viewProfile: "প্ৰফাইল চাওক",
        manifesto: "ইস্তাহাৰ",
        achievements: "সফলতা",
        contactInfo: "যোগাযোগৰ তথ্য",
        
        // Theme
        darkMode: "ডাৰ্ক মোড",
        lightMode: "লাইট মোড",
        
        // Languages
        language: "ভাষা",
        english: "ইংৰাজী",
        hindi: "হিন্দী",
        tamil: "তামিল",
        telugu: "তেলেগু",
        bengali: "বাংলা",
        marathi: "মাৰাঠী",
        gujarati: "গুজৰাটী",
        kannada: "কান্নাড"
    },
    
    or: { // Odia
        // Common
        welcome: "ସ୍ୱାଗତ",
        login: "ଲଗଇନ୍",
        logout: "ଲଗଆଉଟ୍",
        register: "ପଞ୍ଜୀକରଣ",
        submit: "ଦାଖଲ କରନ୍ତୁ",
        cancel: "ବାତିଲ୍",
        save: "ସଂରକ୍ଷଣ",
        delete: "ବିଲୋପ",
        edit: "ସମ୍ପାଦନା",
        back: "ପଛକୁ",
        next: "ପରବର୍ତ୍ତୀ",
        loading: "ଲୋଡ୍ ହେଉଛି...",
        error: "ତ୍ରୁଟି",
        success: "ସଫଳତା",
        
        // Voter Portal
        voterPortal: "ଭୋଟର ପୋର୍ଟାଲ୍",
        voterSubtitle: "✅ ସୁରକ୍ଷିତ ଭାବରେ ପଞ୍ଜୀକରଣ କରନ୍ତୁ, ଭୋଟ୍ ଦିଅନ୍ତୁ ଏବଂ ଯାଞ୍ଚ କରନ୍ତୁ",
        voterId: "ଭୋଟର ID",
        voterToken: "ଭୋଟର ଟୋକେନ୍",
        enterVoterId: "ଆପଣଙ୍କର ଭୋଟର ID ପ୍ରବେଶ କରନ୍ତୁ",
        enterVoterToken: "ଆପଣଙ୍କର ଭୋଟର ଟୋକେନ୍ ପ୍ରବେଶ କରନ୍ତୁ",
        voterLogin: "ଭୋଟର ଲଗଇନ୍",
        secureVoting: "ସୁରକ୍ଷିତ ବ୍ଲକଚେନ୍ ଭୋଟିଂ",
        currentElections: "ବର୍ତ୍ତମାନ ନିର୍ବାଚନ",
        castYourVote: "ଆପଣଙ୍କ ଭୋଟ୍ ଦିଅନ୍ତୁ",
        selectCandidate: "ପ୍ରାର୍ଥୀ ଚୟନ କରନ୍ତୁ",
        confirmVote: "ଭୋଟ୍ ନିଶ୍ଚିତ କରନ୍ତୁ",
        voteRecorded: "ଭୋଟ୍ ସଫଳତାର ସହିତ ରେକର୍ଡ ହୋଇଛି",
        alreadyVoted: "ଆପଣ ପୂର୍ବରୁ ଭୋଟ୍ ଦେଇସାରିଛନ୍ତି",
        noElections: "କୌଣସି ସକ୍ରିୟ ନିର୍ବାଚନ ଉପଲବ୍ଧ ନାହିଁ",
        selectState: "ରାଜ୍ୟ ଚୟନ କରନ୍ତୁ",
        voterRegistration: "ଭୋଟର ପଞ୍ଜୀକରଣ",
        selectYourState: "ଆପଣଙ୍କର ରାଜ୍ୟ ଚୟନ କରନ୍ତୁ *",
        aadhaarNumber: "ଆଧାର ସଂଖ୍ୟା (12 ଅଙ୍କ) *",
        enterAadhaar: "ଆଧାର ସଂଖ୍ୟା ପ୍ରବେଶ କରନ୍ତୁ",
        requestOtp: "OTP ଅନୁରୋଧ କରନ୍ତୁ",
        enterOtp: "OTP ପ୍ରବେଶ କରନ୍ତୁ",
        enter6DigitOtp: "6 ଅଙ୍କ ବିଶିଷ୍ଟ OTP ପ୍ରବେଶ କରନ୍ତୁ",
        completeRegistration: "ପଞ୍ଜୀକରଣ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ",
        
        // Admin Portal
        adminPortal: "ଆଡମିନ୍ ପୋର୍ଟାଲ୍",
        adminSubtitle: "🎯 ନିର୍ବାଚନ ପରିଚାଳନା କରନ୍ତୁ, ଭୋଟ୍ ମନିଟର କରନ୍ତୁ, ସ୍ୱଚ୍ଛତା ନିଶ୍ଚିତ କରନ୍ତୁ",
        username: "ଉପଯୋଗକର୍ତ୍ତା ନାମ",
        password: "ପାସୱାର୍ଡ",
        createElection: "ନିର୍ବାଚନ ସୃଷ୍ଟି କରନ୍ତୁ",
        electionTitle: "ନିର୍ବାଚନ ଶୀର୍ଷକ",
        description: "ବର୍ଣ୍ଣନା",
        startTime: "ଆରମ୍ଭ ସମୟ",
        endTime: "ସମାପ୍ତି ସମୟ",
        candidates: "ପ୍ରାର୍ଥୀମାନେ",
        addCandidate: "ପ୍ରାର୍ଥୀ ଯୋଗ କରନ୍ତୁ",
        
        // Statistics
        statistics: "ପରିସଂଖ୍ୟାନ",
        voterTurnout: "ଭୋଟର ଉପସ୍ଥିତି",
        totalVotes: "ମୋଟ ଭୋଟ୍",
        totalElections: "ମୋଟ ନିର୍ବାଚନ",
        activeElections: "ସକ୍ରିୟ ନିର୍ବାଚନ",
        participationRate: "ଅଂଶଗ୍ରହଣ ହାର",
        stateWiseBreakdown: "ରାଜ୍ୟ ଅନୁଯାୟୀ ବିବରଣୀ",
        
        // Candidate
        candidateName: "ପ୍ରାର୍ଥୀଙ୍କ ନାମ",
        party: "ଦଳ",
        symbol: "ପ୍ରତୀକ",
        viewProfile: "ପ୍ରୋଫାଇଲ୍ ଦେଖନ୍ତୁ",
        manifesto: "ଘୋଷଣାପତ୍ର",
        achievements: "ସଫଳତା",
        contactInfo: "ଯୋଗାଯୋଗ ସୂଚନା",
        
        // Theme
        darkMode: "ଡାର୍କ ମୋଡ୍",
        lightMode: "ଲାଇଟ୍ ମୋଡ୍",
        
        // Languages
        language: "ଭାଷା",
        english: "ଇଂରାଜୀ",
        hindi: "ହିନ୍ଦୀ",
        tamil: "ତାମିଲ୍",
        telugu: "ତେଲୁଗୁ",
        bengali: "ବଙ୍ଗାଳୀ",
        marathi: "ମରାଠୀ",
        gujarati: "ଗୁଜୁରାଟୀ",
        kannada: "କନ୍ନଡ"
    },
    
    ur: { // Urdu
        // Common
        welcome: "خوش آمدید",
        login: "لاگ ان",
        logout: "لاگ آؤٹ",
        register: "رجسٹر",
        submit: "جمع کریں",
        cancel: "منسوخ کریں",
        save: "محفوظ کریں",
        delete: "حذف کریں",
        edit: "ترمیم کریں",
        back: "واپس",
        next: "اگلا",
        loading: "لوڈ ہو رہا ہے...",
        error: "خرابی",
        success: "کامیابی",
        
        // Voter Portal
        voterPortal: "ووٹر پورٹل",
        voterSubtitle: "✅ محفوظ طریقے سے رجسٹر کریں، ووٹ دیں اور تصدیق کریں",
        voterId: "ووٹر ID",
        voterToken: "ووٹر ٹوکن",
        enterVoterId: "اپنی ووٹر ID درج کریں",
        enterVoterToken: "اپنا ووٹر ٹوکن درج کریں",
        voterLogin: "ووٹر لاگ ان",
        secureVoting: "محفوظ بلاک چین ووٹنگ",
        currentElections: "موجودہ انتخابات",
        castYourVote: "اپنا ووٹ ڈالیں",
        selectCandidate: "امیدوار منتخب کریں",
        confirmVote: "ووٹ کی تصدیق کریں",
        voteRecorded: "ووٹ کامیابی سے ریکارڈ ہو گیا",
        alreadyVoted: "آپ پہلے ہی ووٹ دے چکے ہیں",
        noElections: "کوئی فعال انتخابات دستیاب نہیں",
        selectState: "ریاست منتخب کریں",
        voterRegistration: "ووٹر رجسٹریشن",
        selectYourState: "اپنی ریاست منتخب کریں *",
        aadhaarNumber: "آدھار نمبر (12 ہندسے) *",
        enterAadhaar: "آدھار نمبر درج کریں",
        requestOtp: "OTP کی درخواست کریں",
        enterOtp: "OTP درج کریں",
        enter6DigitOtp: "6 ہندسوں کا OTP درج کریں",
        completeRegistration: "رجسٹریشن مکمل کریں",
        
        // Admin Portal
        adminPortal: "ایڈمن پورٹل",
        adminSubtitle: "🎯 انتخابات کا انتظام کریں، ووٹوں کی نگرانی کریں، شفافیت کو یقینی بنائیں",
        username: "صارف نام",
        password: "پاس ورڈ",
        createElection: "انتخاب بنائیں",
        electionTitle: "انتخاب کا عنوان",
        description: "تفصیل",
        startTime: "شروع کا وقت",
        endTime: "اختتام کا وقت",
        candidates: "امیدوار",
        addCandidate: "امیدوار شامل کریں",
        
        // Statistics
        statistics: "اعدادوشمار",
        voterTurnout: "ووٹر حاضری",
        totalVotes: "کل ووٹ",
        totalElections: "کل انتخابات",
        activeElections: "فعال انتخابات",
        participationRate: "شرکت کی شرح",
        stateWiseBreakdown: "ریاست کے لحاظ سے تفصیلات",
        
        // Candidate
        candidateName: "امیدوار کا نام",
        party: "پارٹی",
        symbol: "علامت",
        viewProfile: "پروفائل دیکھیں",
        manifesto: "منشور",
        achievements: "کامیابیاں",
        contactInfo: "رابطے کی معلومات",
        
        // Theme
        darkMode: "ڈارک موڈ",
        lightMode: "لائٹ موڈ",
        
        // Languages
        language: "زبان",
        english: "انگریزی",
        hindi: "ہندی",
        tamil: "تمل",
        telugu: "تیلگو",
        bengali: "بنگالی",
        marathi: "مراٹھی",
        gujarati: "گجراتی",
        kannada: "کنّڑ"
    },
    
    ne: { // Nepali
        // Common
        welcome: "स्वागत छ",
        login: "लगइन",
        logout: "लगआउट",
        register: "दर्ता",
        submit: "पेश गर्नुहोस्",
        cancel: "रद्द गर्नुहोस्",
        save: "सेभ गर्नुहोस्",
        delete: "मेटाउनुहोस्",
        edit: "सम्पादन गर्नुहोस्",
        back: "पछाडि",
        next: "अगाडि",
        loading: "लोड हुँदैछ...",
        error: "त्रुटि",
        success: "सफलता",
        
        // Voter Portal
        voterPortal: "मतदाता पोर्टल",
        voterSubtitle: "✅ सुरक्षित रूपमा दर्ता गर्नुहोस्, मतदान गर्नुहोस् र प्रमाणित गर्नुहोस्",
        voterId: "मतदाता ID",
        voterToken: "मतदाता टोकन",
        enterVoterId: "आफ्नो मतदाता ID प्रविष्ट गर्नुहोस्",
        enterVoterToken: "आफ्नो मतदाता टोकन प्रविष्ट गर्नुहोस्",
        voterLogin: "मतदाता लगइन",
        secureVoting: "सुरक्षित ब्लकचेन मतदान",
        currentElections: "हालका निर्वाचनहरू",
        castYourVote: "आफ्नो मत दिनुहोस्",
        selectCandidate: "उम्मेदवार छान्नुहोस्",
        confirmVote: "मत पुष्टि गर्नुहोस्",
        voteRecorded: "मत सफलतापूर्वक रेकर्ड गरियो",
        alreadyVoted: "तपाईंले पहिले नै मतदान गर्नुभएको छ",
        noElections: "कुनै सक्रिय निर्वाचन उपलब्ध छैन",
        selectState: "राज्य छान्नुहोस्",
        voterRegistration: "मतदाता दर्ता",
        selectYourState: "आफ्नो राज्य छान्नुहोस् *",
        aadhaarNumber: "आधार नम्बर (12 अंक) *",
        enterAadhaar: "आधार नम्बर प्रविष्ट गर्नुहोस्",
        requestOtp: "OTP अनुरोध गर्नुहोस्",
        enterOtp: "OTP प्रविष्ट गर्नुहोस्",
        enter6DigitOtp: "6 अंकको OTP प्रविष्ट गर्नुहोस्",
        completeRegistration: "दर्ता पूरा गर्नुहोस्",
        
        // Admin Portal
        adminPortal: "प्रशासक पोर्टल",
        adminSubtitle: "🎯 निर्वाचन व्यवस्थापन गर्नुहोस्, मतहरू अनुगमन गर्नुहोस्, पारदर्शिता सुनिश्चित गर्नुहोस्",
        username: "प्रयोगकर्ता नाम",
        password: "पासवर्ड",
        createElection: "निर्वाचन सिर्जना गर्नुहोस्",
        electionTitle: "निर्वाचन शीर्षक",
        description: "विवरण",
        startTime: "सुरु समय",
        endTime: "समाप्ति समय",
        candidates: "उम्मेदवारहरू",
        addCandidate: "उम्मेदवार थप्नुहोस्",
        
        // Statistics
        statistics: "तथ्याङ्क",
        voterTurnout: "मतदाता उपस्थिति",
        totalVotes: "कुल मतहरू",
        totalElections: "कुल निर्वाचनहरू",
        activeElections: "सक्रिय निर्वाचनहरू",
        participationRate: "सहभागिता दर",
        stateWiseBreakdown: "राज्य अनुसार विवरण",
        
        // Candidate
        candidateName: "उम्मेदवारको नाम",
        party: "पार्टी",
        symbol: "चिन्ह",
        viewProfile: "प्रोफाइल हेर्नुहोस्",
        manifesto: "घोषणापत्र",
        achievements: "उपलब्धिहरू",
        contactInfo: "सम्पर्क जानकारी",
        
        // Theme
        darkMode: "डार्क मोड",
        lightMode: "लाइट मोड",
        
        // Languages
        language: "भाषा",
        english: "अंग्रेजी",
        hindi: "हिन्दी",
        tamil: "तमिल",
        telugu: "तेलुगु",
        bengali: "बंगाली",
        marathi: "मराठी",
        gujarati: "गुजराती",
        kannada: "कन्नड"
    }
};

// State to primary language mapping
const stateLanguages = {
    "Andhra Pradesh": "te",
    "Telangana": "te",
    "Tamil Nadu": "ta",
    "Karnataka": "kn",
    "Kerala": "ml",
    "Maharashtra": "mr",
    "Gujarat": "gu",
    "West Bengal": "bn",
    "Bihar": "hi",
    "Uttar Pradesh": "hi",
    "Madhya Pradesh": "hi",
    "Rajasthan": "hi",
    "Haryana": "hi",
    "Punjab": "pa",
    "Himachal Pradesh": "hi",
    "Uttarakhand": "hi",
    "Jharkhand": "hi",
    "Chhattisgarh": "hi",
    "Delhi": "hi",
    "Goa": "mr",
    "Default": "en"
};

// Get browser language or default to English
function getCurrentLanguage() {
    return localStorage.getItem('preferredLanguage') || 'en';
}

// Set language preference
function setLanguage(langCode) {
    localStorage.setItem('preferredLanguage', langCode);
    applyTranslations();
}

// Get translation for a key
function t(key) {
    const lang = getCurrentLanguage();
    return translations[lang]?.[key] || translations.en[key] || key;
}

// Apply translations to all elements with data-translate attribute
function applyTranslations() {
    const lang = getCurrentLanguage();
    console.log('🌐 Applying translations for:', lang);
    
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = translations[lang]?.[key] || translations.en?.[key] || key;
        
        if (translation === key) {
            console.warn('⚠️ Translation missing for key:', key, 'in language:', lang);
        }
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            // Preserve emojis and icons at the start
            if (element.textContent.startsWith('✅') || element.textContent.startsWith('🗳️')) {
                const emoji = element.textContent.match(/^[\u{1F300}-\u{1F9FF}]|^✅/u)?.[0] || '';
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update language selectors (both login and dashboard)
    const langSelector = document.getElementById('languageSelector');
    const dashboardLangSelector = document.getElementById('dashboardLanguageSelector');
    if (langSelector) {
        langSelector.value = lang;
    }
    if (dashboardLangSelector) {
        dashboardLangSelector.value = lang;
    }
}

// Auto-detect language based on state selection
function autoDetectLanguage(stateName) {
    const langCode = stateLanguages[stateName] || stateLanguages.Default;
    if (translations[langCode]) {
        setLanguage(langCode);
    }
}

// Initialize translations on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Translations system initialized');
    applyTranslations();
    
    // Add event listener to language selectors (login and dashboard)
    const langSelector = document.getElementById('languageSelector');
    const dashboardLangSelector = document.getElementById('dashboardLanguageSelector');
    
    if (langSelector) {
        langSelector.addEventListener('change', function(e) {
            console.log('🔄 Language changed to:', e.target.value);
            setLanguage(e.target.value);
        });
    }
    
    if (dashboardLangSelector) {
        dashboardLangSelector.addEventListener('change', function(e) {
            console.log('🔄 Language changed to:', e.target.value);
            setLanguage(e.target.value);
        });
    }
    
    // Reapply translations periodically to catch dynamically loaded content
    setInterval(function() {
        applyTranslations();
    }, 1000);
});
