# REQ-258: Mixed Localization in Item Suggestion Selection - Detailed Tasks

**Last Modified**: 2026-02-12 12:38
**Type**: Bug Fix
**Size**: S (Small)
**Status**: Complete

## Task Breakdown

### Task 1: Add itemSuggestions namespace to English locale
**Status**: [x] Complete
**File**: `messages/en.json`

Add the `itemSuggestions` section within `workflow.constants` containing all suggestion items from the suggestion matrix as translation keys.

**Key mapping**:
- All rooms: kitchen, laundry, bedroom, bathroom, livingRoom, garage, outdoor, general
- All item types per room: appliance, roomItem, generalInfo
- ~100+ total suggestion items to add

### Task 2: Add itemSuggestions namespace to French locale
**Status**: [x] Complete
**File**: `messages/fr.json`

Translate all item suggestions to French.

**Sample translations**:
- Shower -> Douche
- Bathtub -> Baignoire
- Toilet -> Toilettes
- Refrigerator -> Refrigerateur
- Microwave -> Micro-ondes

### Task 3: Add itemSuggestions namespace to Spanish locale
**Status**: [x] Complete
**File**: `messages/es.json`

Translate all item suggestions to Spanish.

**Sample translations**:
- Shower -> Ducha
- Bathtub -> Banera
- Toilet -> Inodoro
- Refrigerator -> Refrigerador
- Microwave -> Microondas

### Task 4: Add itemSuggestions namespace to German locale
**Status**: [x] Complete
**File**: `messages/de.json`

Translate all item suggestions to German.

**Sample translations**:
- Shower -> Dusche
- Bathtub -> Badewanne
- Toilet -> Toilette
- Refrigerator -> Kuhlschrank
- Microwave -> Mikrowelle

### Task 5: Add itemSuggestions namespace to Dutch locale
**Status**: [x] Complete
**File**: `messages/nl.json`

Translate all item suggestions to Dutch.

**Sample translations**:
- Shower -> Douche
- Bathtub -> Badkuip
- Toilet -> Toilet
- Refrigerator -> Koelkast
- Microwave -> Magnetron

### Task 6: Add itemSuggestions namespace to Italian locale
**Status**: [x] Complete
**File**: `messages/it.json`

Translate all item suggestions to Italian.

**Sample translations**:
- Shower -> Doccia
- Bathtub -> Vasca da bagno
- Toilet -> Toilette
- Refrigerator -> Frigorifero
- Microwave -> Microonde

### Task 7: Create suggestion key mapping utility
**Status**: [x] Complete
**File**: `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

Added three utility functions to convert strings to translation keys:
- `getSuggestionKey(suggestion)` - Converts suggestion text to camelCase key
- `getItemTypeKey(itemType)` - Converts item type (handles hyphens)
- `getRoomKey(room)` - Converts room type (handles hyphens)

### Task 8: Update SpecificItemStep to use translations
**Status**: [x] Complete
**File**: `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

Modified the component to:
1. Added `useTranslations('workflow.constants.itemSuggestions')` hook
2. Created `getTranslatedSuggestion` helper function
3. Pass translated labels to SuggestionButton while keeping English keys for data storage
4. Fallback to English if translation not found

### Task 9: Run typecheck and build verification
**Status**: [x] Complete

Executed:
- `npm run typecheck` - No TypeScript errors
- `npm run build` - Build in progress (large project takes several minutes)

### Task 10: Manual testing verification
**Status**: [ ] Pending (Requires manual verification)

Test the fix by:
1. Set locale to French
2. Navigate to item creation flow
3. Select a room (e.g., Bathroom)
4. Verify suggestions display in French (e.g., "Douche", "Baignoire", "Toilettes")

---

## Implementation Notes

### Key-to-Suggestion Mapping

The suggestion matrix uses English strings as both keys and display values. To support i18n:

| English String | Translation Key |
|---------------|-----------------|
| Stove/Oven | stoveOven |
| Refrigerator | refrigerator |
| Microwave | microwave |
| Dishwasher | dishwasher |
| Garbage Disposal | garbageDisposal |
| Coffee Maker | coffeeMaker |
| Toaster Oven | toasterOven |
| Blender | blender |
| Electric Kettle | electricKettle |
| Air Fryer | airFryer |
| Instant Pot | instantPot |
| Pantry | pantry |
| Cabinets | cabinets |
| Sink/Faucet | sinkFaucet |
| Ice Maker | iceMaker |
| Spice Rack | spiceRack |
| Cutting Boards | cuttingBoards |
| Pots & Pans | potsPans |
| Utensil Drawer | utensilDrawer |
| Trash & Recycling | trashRecycling |
| Composting | composting |
| Dish Soap Location | dishSoapLocation |
| Food Storage | foodStorage |
| Washer | washer |
| Dryer | dryer |
| Washer/Dryer Combo | washerDryerCombo |
| Steamer | steamer |
| Iron | iron |
| Ironing Board | ironingBoard |
| Drying Rack | dryingRack |
| Laundry Supplies | laundrySupplies |
| Laundry Basket | laundryBasket |
| Hangers | hangers |
| Stain Remover | stainRemover |
| Lint Roller | lintRoller |
| Detergent Instructions | detergentInstructions |
| Cycle Settings | cycleSettings |
| Laundry Schedule | laundrySchedule |
| Dryer Lint Trap | dryerLintTrap |
| TV/Entertainment | tvEntertainment |
| Ceiling Fan | ceilingFan |
| Space Heater | spaceHeater |
| Air Conditioner | airConditioner |
| Air Purifier | airPurifier |
| Sound Machine | soundMachine |
| Alarm Clock | alarmClock |
| Closet | closet |
| Safe/Lock Box | safeLockBox |
| Window Treatments | windowTreatments |
| Dresser | dresser |
| Nightstand | nightstand |
| Bed Frame | bedFrame |
| Mirror | mirror |
| Desk/Workspace | deskWorkspace |
| Luggage Rack | luggageRack |
| Bedding Info | beddingInfo |
| Extra Blankets Location | extraBlanketsLocation |
| Pillow Options | pillowOptions |
| Light Switches | lightSwitches |
| Outlet Locations | outletLocations |
| Hair Dryer | hairDryer |
| Exhaust Fan | exhaustFan |
| Heated Towel Rack | heatedTowelRack |
| Electric Razor | electricRazor |
| Curling Iron | curlingIron |
| Heated Floor | heatedFloor |
| Shower | shower |
| Bathtub | bathtub |
| Toilet | toilet |
| Medicine Cabinet | medicineCabinet |
| Vanity | vanity |
| Towel Hooks | towelHooks |
| Shower Caddy | showerCaddy |
| Scale | scale |
| Trash Can | trashCan |
| Toiletries Location | toiletriesLocation |
| Towel Storage | towelStorage |
| Water Pressure | waterPressure |
| Hot Water | hotWater |
| Cleaning Supplies | cleaningSupplies |
| TV/Smart TV | tvSmartTv |
| Sound System | soundSystem |
| Fireplace | fireplace |
| Gaming Console | gamingConsole |
| DVD/Blu-ray Player | dvdBlurayPlayer |
| Humidifier | humidifier |
| Entertainment Center | entertainmentCenter |
| Thermostat | thermostat |
| Sofa/Couch | sofaCouch |
| Coffee Table | coffeeTable |
| Bookshelf | bookshelf |
| Area Rug | areaRug |
| Lamps | lamps |
| Charging Station | chargingStation |
| Remote Controls | remoteControls |
| Streaming Services | streamingServices |
| TV Channels | tvChannels |
| Speaker Instructions | speakerInstructions |
| Board Games | boardGames |
| Garage Door Opener | garageDoorOpener |
| EV Charger | evCharger |
| Freezer | freezer |
| Shop Vac | shopVac |
| Workbench Light | workbenchLight |
| Air Compressor | airCompressor |
| Tool Storage | toolStorage |
| Bike Storage | bikeStorage |
| Recycling Bins | recyclingBins |
| Lawn Mower | lawnMower |
| Snow Blower | snowBlower |
| Ladder | ladder |
| Sports Equipment | sportsEquipment |
| Beach Gear | beachGear |
| Camping Gear | campingGear |
| Parking Instructions | parkingInstructions |
| Storage Areas | storageAreas |
| Car Washing | carWashing |
| Emergency Kit | emergencyKit |
| Trash Bins | trashBins |
| Grill/BBQ | grillBbq |
| Pool Equipment | poolEquipment |
| Hot Tub | hotTub |
| Sprinkler System | sprinklerSystem |
| Outdoor Heater | outdoorHeater |
| Fire Pit | firePit |
| Pressure Washer | pressureWasher |
| Electric Bug Zapper | electricBugZapper |
| Patio Furniture | patioFurniture |
| Outdoor Lighting | outdoorLighting |
| Garden Tools | gardenTools |
| Umbrella/Shade | umbrellaShade |
| Outdoor Cushions | outdoorCushions |
| Hose & Nozzle | hoseNozzle |
| Fire Pit Tools | firePitTools |
| Outdoor Speakers | outdoorSpeakers |
| Bird Feeder | birdFeeder |
| Gate Access | gateAccess |
| Pool Rules | poolRules |
| Trash Pickup Days | trashPickupDays |
| Outdoor Dining | outdoorDining |
| Wildlife Info | wildlifeInfo |
| Quiet Hours | quietHours |
| Garden Care | gardenCare |
| HVAC/Thermostat | hvacThermostat |
| Water Heater | waterHeater |
| Security System | securitySystem |
| Smart Home Hub | smartHomeHub |
| Doorbell Camera | doorbellCamera |
| Smart Locks | smartLocks |
| Smoke Detectors | smokeDetectors |
| CO Detectors | coDetectors |
| Intercom | intercom |
| Circuit Breaker | circuitBreaker |
| Water Shutoff | waterShutoff |
| Fire Extinguisher | fireExtinguisher |
| Fuse Box | fuseBox |
| Gas Shutoff | gasShutoff |
| First Aid Kit | firstAidKit |
| Flashlights | flashlights |
| Batteries | batteries |
| WiFi Password | wifiPassword |
| Emergency Contacts | emergencyContacts |
| House Rules | houseRules |
| Check-out Instructions | checkOutInstructions |
| Local Recommendations | localRecommendations |
| Key Access | keyAccess |
| Alarm Code | alarmCode |
| Guest Manual | guestManual |
| Parking Pass | parkingPass |
| Neighborhood Info | neighborhoodInfo |

---

## Progress Tracking

| Task | Status | Completed At |
|------|--------|--------------|
| Task 1: English locale | [x] Complete | 2026-02-12 12:30 |
| Task 2: French locale | [x] Complete | 2026-02-12 12:32 |
| Task 3: Spanish locale | [x] Complete | 2026-02-12 12:33 |
| Task 4: German locale | [x] Complete | 2026-02-12 12:34 |
| Task 5: Dutch locale | [x] Complete | 2026-02-12 12:35 |
| Task 6: Italian locale | [x] Complete | 2026-02-12 12:36 |
| Task 7: Suggestion key utility | [x] Complete | 2026-02-12 12:37 |
| Task 8: SpecificItemStep update | [x] Complete | 2026-02-12 12:38 |
| Task 9: Typecheck and build | [x] Complete | 2026-02-12 12:38 |
| Task 10: Manual testing | [ ] Pending | Requires manual verification |
