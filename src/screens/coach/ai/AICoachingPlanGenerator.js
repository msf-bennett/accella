import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  User,
  Target, 
  TrendingUp,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Download,
  Share2,
  Brain,
  Zap,
  ChevronRight,
  ChevronDown,
  Settings,
  Save,
  Eye,
  Filter,
  Search,
  Star,
  Activity,
  MapPin,
  BarChart3,
  LineChart,
  Layers,
  Award,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Calendar as CalendarIcon,
  FileText,
  Users2,
  UserCheck,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Timer,
  Dumbbell,
  Heart,
  Flame,
  Gauge
} from 'lucide-react';

const AICoachingPlanGenerator = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [planType, setPlanType] = useState('individual'); // 'individual' or 'group'
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriodization, setSelectedPeriodization] = useState('linear');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Plan parameters
  const [planParams, setPlanParams] = useState({
    sport: 'football',
    planName: '',
    duration: 12, // weeks
    ageGroup: 'youth',
    skillLevel: 'intermediate',
    planType: 'individual',
    objectives: ['fitness', 'skill'],
    periodization: 'linear',
    sessionsPerWeek: 3,
    sessionDuration: 90,
    peakingPhase: 'mid-season',
    individualPlayers: [],
    groupSize: 15,
    venue: 'outdoor-field',
    equipment: ['balls', 'cones', 'bibs'],
    medicalConsiderations: [],
    parentalInvolvement: true,
    progressTracking: true,
    nutritionGuidance: false,
    recoveryProtocol: true
  });

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const sports = [
    { id: 'football', name: 'Football', icon: '⚽', ageGroups: ['u8', 'u10', 'u12', 'u14', 'u16', 'u18', 'adult', 'senior'] },
    { id: 'basketball', name: 'Basketball', icon: '🏀', ageGroups: ['u10', 'u12', 'u14', 'u16', 'u18', 'adult'] },
    { id: 'tennis', name: 'Tennis', icon: '🎾', ageGroups: ['u8', 'u10', 'u12', 'u14', 'u16', 'adult'] },
    { id: 'swimming', name: 'Swimming', icon: '🏊', ageGroups: ['u6', 'u8', 'u10', 'u12', 'u14', 'u16', 'adult'] },
    { id: 'athletics', name: 'Athletics', icon: '🏃', ageGroups: ['u8', 'u10', 'u12', 'u14', 'u16', 'u18', 'adult'] }
  ];

  const ageGroupDetails = {
    'u6': { name: 'Under 6', focus: 'Fun & Basic Movement', sessions: 1, duration: 30 },
    'u8': { name: 'Under 8', focus: 'Coordination & Fun', sessions: 2, duration: 45 },
    'u10': { name: 'Under 10', focus: 'Basic Skills', sessions: 2, duration: 60 },
    'u12': { name: 'Under 12', focus: 'Skill Development', sessions: 3, duration: 75 },
    'u14': { name: 'Under 14', focus: 'Technical Skills', sessions: 3, duration: 90 },
    'u16': { name: 'Under 16', focus: 'Advanced Skills', sessions: 4, duration: 90 },
    'u18': { name: 'Under 18', focus: 'Competition Prep', sessions: 4, duration: 120 },
    'adult': { name: 'Adult (18+)', focus: 'Performance', sessions: 4, duration: 120 },
    'senior': { name: 'Senior (35+)', focus: 'Maintenance', sessions: 3, duration: 90 }
  };

  const periodizationTypes = [
    {
      id: 'linear',
      name: 'Linear Periodization',
      description: 'Progressive overload with gradual intensity increase',
      phases: ['Base Building', 'Strength', 'Peak', 'Recovery'],
      bestFor: 'Beginners to intermediate athletes'
    },
    {
      id: 'undulating',
      name: 'Undulating Periodization',
      description: 'Daily/weekly variation in training variables',
      phases: ['Mixed Training', 'Varied Intensity', 'Adaptive', 'Performance'],
      bestFor: 'Advanced athletes, variety seekers'
    },
    {
      id: 'block',
      name: 'Block Periodization',
      description: 'Concentrated training blocks for specific adaptations',
      phases: ['Accumulation', 'Intensification', 'Realization', 'Recovery'],
      bestFor: 'Elite athletes, specific competitions'
    },
    {
      id: 'conjugate',
      name: 'Conjugate Method',
      description: 'Simultaneous development of multiple qualities',
      phases: ['Max Effort', 'Dynamic Effort', 'Repetition', 'Recovery'],
      bestFor: 'Strength sports, experienced athletes'
    }
  ];

  const objectives = [
    { id: 'fitness', name: 'Physical Fitness', icon: Heart, color: 'bg-red-100 text-red-800' },
    { id: 'skill', name: 'Skill Development', icon: Target, color: 'bg-blue-100 text-blue-800' },
    { id: 'tactical', name: 'Tactical Awareness', icon: Brain, color: 'bg-purple-100 text-purple-800' },
    { id: 'mental', name: 'Mental Toughness', icon: Award, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'team', name: 'Team Building', icon: Users2, color: 'bg-green-100 text-green-800' },
    { id: 'competition', name: 'Competition Prep', icon: Trophy, color: 'bg-orange-100 text-orange-800' }
  ];

  const Trophy = ({ className }) => <Award className={className} />;

  const samplePlayers = [
    { id: 1, name: 'Alex Johnson', age: 14, position: 'Midfielder', skillLevel: 'intermediate', strengths: ['passing', 'vision'], weaknesses: ['shooting', 'pace'] },
    { id: 2, name: 'Sarah Chen', age: 13, position: 'Forward', skillLevel: 'advanced', strengths: ['pace', 'finishing'], weaknesses: ['heading', 'defending'] },
    { id: 3, name: 'Mike Rodriguez', age: 15, position: 'Defender', skillLevel: 'beginner', strengths: ['tackling', 'height'], weaknesses: ['ball control', 'passing'] }
  ];

  const samplePlan = {
    id: 1,
    name: "Youth Football Development Plan",
    duration: 12,
    type: "group",
    periodization: "linear",
    phases: [
      {
        id: 1,
        name: "Foundation Phase",
        weeks: "1-3",
        focus: "Base Fitness & Basic Skills",
        intensity: "Low-Medium",
        objectives: ["Build aerobic base", "Master basic techniques", "Team bonding"],
        keyMetrics: ["Attendance", "Basic skill tests", "Fitness baseline"]
      },
      {
        id: 2,
        name: "Development Phase",
        weeks: "4-8",
        focus: "Skill Enhancement & Tactical Introduction",
        intensity: "Medium",
        objectives: ["Advanced techniques", "Position-specific training", "Small-sided games"],
        keyMetrics: ["Technical assessments", "Game understanding", "Physical progress"]
      },
      {
        id: 3,
        name: "Competition Phase",
        weeks: "9-11",
        focus: "Match Preparation & Peak Performance",
        intensity: "High",
        objectives: ["Match tactics", "Set pieces", "Mental preparation"],
        keyMetrics: ["Match performance", "Tactical execution", "Leadership"]
      },
      {
        id: 4,
        name: "Recovery Phase",
        weeks: "12",
        focus: "Active Recovery & Reflection",
        intensity: "Low",
        objectives: ["Recovery", "Season review", "Goal setting"],
        keyMetrics: ["Recovery markers", "Satisfaction survey", "Next season goals"]
      }
    ],
    weeklyStructure: {
      sessionsPerWeek: 3,
      sessionDuration: 90,
      structure: [
        { day: 'Tuesday', focus: 'Technical Skills', duration: 90 },
        { day: 'Thursday', focus: 'Physical & Tactical', duration: 90 },
        { day: 'Saturday', focus: 'Match/Scrimmage', duration: 120 }
      ]
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 4000));
    setGeneratedPlan(samplePlan);
    setIsGenerating(false);
    setCurrentStep(4);
  };

  const renderPlanTypeSelector = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold mb-4">Plan Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => {
            setPlanType('individual');
            setPlanParams(prev => ({ ...prev, planType: 'individual' }));
          }}
          className={`p-6 rounded-xl border-2 transition-all ${
            planType === 'individual' 
              ? 'border-blue-600 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-4 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              planType === 'individual' ? 'bg-blue-600' : 'bg-gray-400'
            }`}>
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-lg">Individual Plan</h4>
              <p className="text-gray-600 text-sm">Personalized for single athlete</p>
            </div>
          </div>
          <div className="text-left text-sm text-gray-600">
            <ul className="space-y-1">
              <li>• Custom training based on individual needs</li>
              <li>• Detailed progress tracking</li>
              <li>• Personalized goals and objectives</li>
              <li>• 1-on-1 coaching focus</li>
            </ul>
          </div>
        </button>
        
        <button
          onClick={() => {
            setPlanType('group');
            setPlanParams(prev => ({ ...prev, planType: 'group' }));
          }}
          className={`p-6 rounded-xl border-2 transition-all ${
            planType === 'group' 
              ? 'border-blue-600 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-4 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              planType === 'group' ? 'bg-blue-600' : 'bg-gray-400'
            }`}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-lg">Group/Team Plan</h4>
              <p className="text-gray-600 text-sm">For teams and groups</p>
            </div>
          </div>
          <div className="text-left text-sm text-gray-600">
            <ul className="space-y-1">
              <li>• Team-based training sessions</li>
              <li>• Group dynamics and teamwork</li>
              <li>• Scalable for multiple athletes</li>
              <li>• Cost-effective approach</li>
            </ul>
          </div>
        </button>
      </div>
    </div>
  );

  const renderBasicParameters = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
              <input
                type="text"
                value={planParams.planName}
                onChange={(e) => setPlanParams(prev => ({ ...prev, planName: e.target.value }))}
                placeholder="Enter plan name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
              <select
                value={planParams.sport}
                onChange={(e) => setPlanParams(prev => ({ ...prev, sport: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sports.map(sport => (
                  <option key={sport.id} value={sport.id}>
                    {sport.icon} {sport.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
              <select
                value={planParams.ageGroup}
                onChange={(e) => setPlanParams(prev => ({ 
                  ...prev, 
                  ageGroup: e.target.value,
                  sessionsPerWeek: ageGroupDetails[e.target.value]?.sessions || 3,
                  sessionDuration: ageGroupDetails[e.target.value]?.duration || 90
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sports.find(s => s.id === planParams.sport)?.ageGroups.map(age => (
                  <option key={age} value={age}>
                    {ageGroupDetails[age]?.name} - {ageGroupDetails[age]?.focus}
                  </option>
                ))}
              </select>
              {ageGroupDetails[planParams.ageGroup] && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Recommended:</strong> {ageGroupDetails[planParams.ageGroup].sessions} sessions/week, 
                    {ageGroupDetails[planParams.ageGroup].duration} minutes per session
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Duration: {planParams.duration} weeks
              </label>
              <input
                type="range"
                min="4"
                max="52"
                value={planParams.duration}
                onChange={(e) => setPlanParams(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4 weeks</span>
                <span>1 year</span>
              </div>
            </div>
          </div>
        </div>

        {planType === 'individual' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Individual Player Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Player</label>
                <select
                  value={selectedPlayer?.id || ''}
                  onChange={(e) => {
                    const player = samplePlayers.find(p => p.id === parseInt(e.target.value));
                    setSelectedPlayer(player);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a player...</option>
                  {samplePlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} - {player.position} (Age {player.age})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlayer && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Position:</span>
                      <span className="ml-2 font-medium">{selectedPlayer.position}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Level:</span>
                      <span className="ml-2 font-medium capitalize">{selectedPlayer.skillLevel}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-1">Strengths:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlayer.strengths.map(strength => (
                        <span key={strength} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">
                          {strength}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mb-1 mt-2">Areas to improve:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlayer.weaknesses.map(weakness => (
                        <span key={weakness} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full capitalize">
                          {weakness}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {planType === 'group' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Group Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Size: {planParams.groupSize} players
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={planParams.groupSize}
                  onChange={(e) => setPlanParams(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 players</span>
                  <span>30 players</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Skill Level</label>
                <select
                  value={planParams.skillLevel}
                  onChange={(e) => setPlanParams(prev => ({ ...prev, skillLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="mixed">Mixed Levels</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Training Objectives</h3>
          <div className="grid grid-cols-2 gap-2">
            {objectives.map(obj => {
              const IconComponent = obj.icon;
              return (
                <button
                  key={obj.id}
                  onClick={() => {
                    const newObjectives = planParams.objectives.includes(obj.id)
                      ? planParams.objectives.filter(o => o !== obj.id)
                      : [...planParams.objectives, obj.id];
                    setPlanParams(prev => ({ ...prev, objectives: newObjectives }));
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    planParams.objectives.includes(obj.id) 
                      ? obj.color 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{obj.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Schedule Parameters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sessions per Week: {planParams.sessionsPerWeek}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={planParams.sessionsPerWeek}
                onChange={(e) => setPlanParams(prev => ({ ...prev, sessionsPerWeek: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Duration: {planParams.sessionDuration} minutes
              </label>
              <input
                type="range"
                min="30"
                max="180"
                step="15"
                value={planParams.sessionDuration}
                onChange={(e) => setPlanParams(prev => ({ ...prev, sessionDuration: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Peak Performance Target</label>
              <select
                value={planParams.peakingPhase}
                onChange={(e) => setPlanParams(prev => ({ ...prev, peakingPhase: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="early-season">Early Season</option>
                <option value="mid-season">Mid Season</option>
                <option value="late-season">Late Season</option>
                <option value="playoffs">Playoffs</option>
                <option value="championship">Championship</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Additional Features</h3>
          <div className="space-y-3">
            {[
              { id: 'parentalInvolvement', label: 'Parental Progress Updates', desc: 'Regular reports for parents' },
              { id: 'progressTracking', label: 'Performance Tracking', desc: 'Detailed metrics and analytics' },
              { id: 'nutritionGuidance', label: 'Nutrition Guidance', desc: 'Age-appropriate nutrition plans' },
              { id: 'recoveryProtocol', label: 'Recovery Protocols', desc: 'Rest and recovery guidelines' }
            ].map(feature => (
              <label key={feature.id} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={planParams[feature.id]}
                  onChange={(e) => setPlanParams(prev => ({ ...prev, [feature.id]: e.target.checked }))}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{feature.label}</div>
                  <div className="text-sm text-gray-500">{feature.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPeriodization = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Periodization Model</h3>
        <p className="text-gray-600 mb-6">Choose how training load and intensity will be structured over time</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {periodizationTypes.map(period => (
            <button
              key={period.id}
              onClick={() => {
                setSelectedPeriodization(period.id);
                setPlanParams(prev => ({ ...prev, periodization: period.id }));
              }}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                selectedPeriodization === period.id 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-lg">{period.name}</h4>
                {selectedPeriodization === period.id && (
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4">{period.description}</p>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Training Phases:</div>
                <div className="flex flex-wrap gap-1">
                  {period.phases.map((phase, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {phase}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-3">
                  <strong>Best for:</strong> {period.bestFor}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Periodization Preview */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Periodization Preview</h3>
        <div className="relative">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Low Intensity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Medium Intensity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">High Intensity</span>
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-1 h-24 bg-gray-50 rounded-lg p-2">
            {Array.from({ length: Math.min(planParams.duration, 12) }, (_, week) => {
              let intensity = 'bg-green-500';
              if (selectedPeriodization === 'linear') {
                if (week < planParams.duration * 0.3) intensity = 'bg-green-500';
                else if (week < planParams.duration * 0.8) intensity = 'bg-yellow-500';
                else if (week < planParams.duration * 0.9) intensity = 'bg-red-500';
                else intensity = 'bg-green-400';
              } else if (selectedPeriodization === 'undulating') {
                intensity = week % 3 === 0 ? 'bg-red-500' : week % 3 === 1 ? 'bg-yellow-500' : 'bg-green-500';
              } else if (selectedPeriodization === 'block') {
                const phase = Math.floor(week / (planParams.duration / 4));
                intensity = phase === 0 ? 'bg-green-500' : phase === 1 ? 'bg-yellow-500' : phase === 2 ? 'bg-red-500' : 'bg-green-400';
              }
              
              return (
                <div
                  key={week}
                  className={`${intensity} rounded flex-1 min-h-full flex items-end justify-center pb-1`}
                >
                  <span className="text-xs text-white font-medium">{week + 1}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Week-by-week intensity visualization (first 12 weeks shown)
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Advanced Periodization Settings</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taper Duration (weeks)</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="1">1 week</option>
                  <option value="2">2 weeks</option>
                  <option value="3">3 weeks</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deload Frequency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="3">Every 3 weeks</option>
                  <option value="4">Every 4 weeks</option>
                  <option value="6">Every 6 weeks</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Volume Emphasis (%)</label>
                <input
                  type="range"
                  min="30"
                  max="70"
                  defaultValue="50"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Intensity Focus</span>
                  <span>Volume Focus</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Competition Frequency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="seasonal">End of Season</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderGenerationStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
        {!isGenerating && !generatedPlan ? (
          <>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Ready to Generate Your Coaching Plan</h3>
            <p className="text-gray-600 mb-6">
              AI will create a comprehensive {planParams.duration}-week {planType} coaching plan with {selectedPeriodization} periodization
            </p>
            
            {/* Plan Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold mb-4">Plan Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <div className="mb-2">
                    <span className="text-gray-500">Plan Type:</span>
                    <span className="ml-2 font-medium capitalize">{planType}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium">{planParams.duration} weeks</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-500">Age Group:</span>
                    <span className="ml-2 font-medium">{ageGroupDetails[planParams.ageGroup]?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sessions/Week:</span>
                    <span className="ml-2 font-medium">{planParams.sessionsPerWeek}</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="mb-2">
                    <span className="text-gray-500">Sport:</span>
                    <span className="ml-2 font-medium capitalize">{planParams.sport}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-500">Periodization:</span>
                    <span className="ml-2 font-medium capitalize">{selectedPeriodization}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-500">Group Size:</span>
                    <span className="ml-2 font-medium">{planType === 'group' ? planParams.groupSize : '1'} player{planType === 'group' && planParams.groupSize > 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Peak Phase:</span>
                    <span className="ml-2 font-medium capitalize">{planParams.peakingPhase.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-left">
                  <span className="text-gray-500 text-sm">Objectives:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {planParams.objectives.map(objId => {
                      const obj = objectives.find(o => o.id === objId);
                      return (
                        <span key={objId} className={`px-2 py-1 text-xs rounded-full ${obj?.color}`}>
                          {obj?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2 mx-auto"
            >
              <Zap className="w-5 h-5" />
              <span>Generate Coaching Plan</span>
            </button>
          </>
        ) : isGenerating ? (
          <>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Generating Your Coaching Plan...</h3>
            <p className="text-gray-600 mb-6">
              AI is creating a comprehensive plan with periodization, age-appropriate exercises, and progressive development
            </p>
            <div className="space-y-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse w-3/4"></div>
              </div>
              <div className="text-sm text-gray-500">
                Analyzing parameters • Creating phases • Structuring workouts • Adding age considerations...
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Coaching Plan Generated Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your comprehensive {planParams.duration}-week coaching plan with {selectedPeriodization} periodization is ready
            </p>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 mx-auto"
            >
              <Eye className="w-5 h-5" />
              <span>Review Plan</span>
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderPlanReview = () => (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{generatedPlan.name}</h2>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{generatedPlan.duration} weeks</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span className="capitalize">{generatedPlan.type} plan</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span className="capitalize">{generatedPlan.periodization} periodization</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{generatedPlan.weeklyStructure.sessionsPerWeek} sessions/week</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Edit3 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Copy className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekly Structure */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Weekly Training Schedule</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {generatedPlan.weeklyStructure.structure.map((session, index) => (
              <div key={index} className="bg-white rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{session.day}</span>
                  <span className="text-sm text-gray-500">{session.duration}min</span>
                </div>
                <p className="text-sm text-gray-600">{session.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Training Phases */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Training Phases Breakdown</h3>
        <div className="space-y-4">
          {generatedPlan.phases.map((phase, index) => (
            <div key={phase.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-yellow-500' : 
                      index === 2 ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                      <p className="text-sm text-gray-600">Weeks {phase.weeks} • {phase.intensity} Intensity</p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Focus Area</h5>
                  <p className="text-gray-700">{phase.focus}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Key Objectives</h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {phase.objectives.map((objective, objIndex) => (
                      <li key={objIndex}>{objective}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Success Metrics</h5>
                  <div className="flex flex-wrap gap-2">
                    {phase.keyMetrics.map((metric, metricIndex) => (
                      <span key={metricIndex} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Age-Specific Considerations */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Age-Specific Considerations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Development Focus</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Fundamental movement skills development</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Age-appropriate training loads and recovery</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Fun and engaging activity selection</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Psychological development and confidence building</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Safety Guidelines</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>Modified intensity for growing bodies</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>Increased focus on injury prevention</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>Regular hydration and nutrition breaks</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>Parental communication protocols</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Parameters</span>
        </button>
        <div className="flex items-center space-x-3">
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Plan</span>
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <PlayCircle className="w-4 h-4" />
            <span>Start Plan</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreateTab = () => (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {[
          { step: 1, label: 'Plan Type', icon: Users },
          { step: 2, label: 'Parameters', icon: Settings },
          { step: 3, label: 'Periodization', icon: TrendingUp },
          { step: 4, label: 'Review', icon: Eye }
        ].map(({ step, label, icon: Icon }) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {label}
              </p>
            </div>
            {step < 4 && (
              <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <div>
          {renderPlanTypeSelector()}
          {renderBasicParameters()}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>Next: Periodization</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && renderPeriodization()}
      {currentStep === 2 && (
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>Generate Plan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {currentStep === 3 && renderGenerationStep()}
      {currentStep === 4 && renderPlanReview()}
    </div>
  );

  const renderMyPlansTab = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Sports</option>
              <option>Football</option>
              <option>Basketball</option>
              <option>Tennis</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Types</option>
              <option>Individual</option>
              <option>Group</option>
            </select>
          </div>
          <button
            onClick={() => setActiveTab('create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            id: 1,
            name: "Youth Football Development",
            sport: "Football",
            type: "group",
            duration: 12,
            players: 15,
            status: "active",
            progress: 45
          },
          {
            id: 2,
            name: "Elite Tennis Training",
            sport: "Tennis",
            type: "individual",
            duration: 16,
            players: 1,
            status: "completed",
            progress: 100
          },
          {
            id: 3,
            name: "Basketball Skills Camp",
            sport: "Basketball",
            type: "group",
            duration: 8,
            players: 20,
            status: "draft",
            progress: 0
          }
        ].map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.sport} • {plan.duration} weeks</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                plan.status === 'active' ? 'bg-green-100 text-green-800' :
                plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {plan.status}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{plan.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Players:</span>
                <span className="font-medium">{plan.players}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress:</span>
                <span className="font-medium">{plan.progress}%</span>
              </div>
              
              {plan.status === 'active' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${plan.progress}%` }}
                  ></div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                View Plan
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      {/* Template Categories */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Browse Templates</h3>
          <div className="flex items-center space-x-2">
            {['All', 'Youth', 'Adult', 'Elite', 'Beginner'].map(category => (
              <button
                key={category}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Templates */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Featured Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 1,
              name: "Youth Soccer Fundamentals",
              sport: "Football",
              ageGroup: "U10",
              duration: 8,
              rating: 4.9,
              uses: 1245,
              features: ["Age-appropriate", "Fun-focused", "Parent guides"]
            },
            {
              id: 2,
              name: "Basketball Skills Progression",
              sport: "Basketball",
              ageGroup: "U14",
              duration: 12,
              rating: 4.8,
              uses: 856,
              features: ["Skill-based", "Progressive", "Competition prep"]
            },
            {
              id: 3,
              name: "Tennis Academy Program",
              sport: "Tennis",
              ageGroup: "U16",
              duration: 16,
              rating: 4.7,
              uses: 523,
              features: ["Individual focus", "Match tactics", "Mental training"]
            }
          ].map(template => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.sport} • {template.ageGroup} • {template.duration} weeks</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{template.rating}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {template.features.map((feature, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-1">
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{template.uses} coaches used this</span>
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Use Template
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Template Creation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Custom Template</h3>
            <p className="text-gray-600">Build your own template from successful plans and share with the community</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Coaching Plan Generator</h1>
            <p className="text-gray-600 text-sm mt-1">Create comprehensive, age-specific coaching plans with advanced periodization</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {[
            { id: 'create', label: 'Create Plan', icon: Plus },
            { id: 'plans', label: 'My Plans', icon: FileText },
            { id: 'templates', label: 'Templates', icon: Layers }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'create' && renderCreateTab()}
          {activeTab === 'plans' && renderMyPlansTab()}
          {activeTab === 'templates' && renderTemplatesTab()}
        </div>
      </div>
    </div>
  );
};

export default AICoachingPlanGenerator;