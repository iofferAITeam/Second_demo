# iOffer AI Agent Routing Test Cases

## Overview
This document outlines test cases for identifying and resolving routing errors in the iOffer AI system, specifically focusing on context confusion and incorrect agent routing scenarios.

## Test Case 1: Context Confusion Routing Error

### Description
Agent routing fails due to context confusion when user provides incomplete or ambiguous responses to agent questions.

### Test Scenario
**Agent**: "Do you want to update any info?"
**User**: "major"
**Expected Behavior**: Should route to Student Info Agent for major updates
**Actual Behavior**: Routes to General QA Agent (incorrect routing)

### Test Steps
1. Start conversation with Student Info Agent
2. Agent asks: "Do you want to update any info?"
3. User responds with: "major"
4. Observe routing behavior
5. Verify if correct agent is selected

### Expected Result
- Should route to Student Info Agent
- Should recognize "major" as a request to update major information
- Should not route to General QA Agent

### Actual Result
- Incorrectly routes to General QA Agent
- Loses context of the original conversation

### Severity
**High** - Core functionality failure

### Root Cause Analysis
- Context preservation failure
- Intent recognition confusion
- Routing logic doesn't consider conversation history

---

## Test Case 2: Negative Response Routing Error

### Description
Agent routing fails when user provides negative responses to update questions, incorrectly routing to General QA instead of maintaining context.

### Test Scenario
**Agent**: "Do you want to update your information?"
**User**: "I don't want to update my major."
**Expected Behavior**: Should maintain context with Student Info Agent
**Actual Behavior**: Sometimes routes to General QA Agent (incorrect routing)

### Test Steps
1. Start conversation with Student Info Agent
2. Agent asks: "Do you want to update your information?"
3. User responds with: "I don't want to update my major."
4. Observe routing behavior
5. Verify if correct agent maintains context

### Expected Result
- Should remain with Student Info Agent
- Should acknowledge the negative response
- Should offer alternative options or conclude appropriately
- Should NOT route to General QA Agent

### Actual Result
- Sometimes incorrectly routes to General QA Agent
- Loses context of the original conversation

### Severity
**Medium** - User experience degradation

### Root Cause Analysis
- Negative response handling failure
- Context switching on negative responses
- Routing logic doesn't distinguish between positive/negative update requests

---

## Test Case 3: Context Preservation Validation

### Description
Validate that conversation context is properly maintained across multiple exchanges within the same agent domain.

### Test Steps
1. Start conversation with Student Info Agent
2. Ask multiple questions about student information
3. Provide partial responses
4. Verify context is maintained
5. Test edge cases with ambiguous responses

### Expected Result
- Context should be preserved throughout conversation
- Agent should remember previous questions and responses
- Routing should remain consistent within the same domain

---

## Test Case 4: Intent Recognition Accuracy

### Description
Test the accuracy of intent recognition for various user response patterns.

### Test Cases
- **Partial responses**: "major", "gpa", "school"
- **Negative responses**: "no", "I don't want to", "not now"
- **Ambiguous responses**: "maybe", "later", "I'll think about it"
- **Multi-word responses**: "update my major", "change my GPA"

### Expected Result
- Intent should be correctly identified
- Appropriate agent should be selected
- Context should be maintained

---

## Test Case 5: Routing Logic Validation

### Description
Validate the routing logic handles edge cases correctly.

### Test Cases
- **Empty responses**: ""
- **Special characters**: "!", "?", "."
- **Numbers**: "123", "3.5"
- **Mixed content**: "major 3.5", "gpa update"

### Expected Result
- Routing should handle edge cases gracefully
- Should not crash or route incorrectly
- Should provide appropriate error handling

---

## Implementation Recommendations

### 1. Context Management
- Implement conversation state tracking
- Store conversation history per session
- Maintain agent context across exchanges

### 2. Intent Recognition Enhancement
- Improve natural language processing for partial responses
- Add context-aware intent classification
- Implement fallback mechanisms for ambiguous inputs

### 3. Routing Logic Improvement
- Add context validation before routing decisions
- Implement agent-specific response handling
- Add routing confidence scoring

### 4. Testing Framework
- Implement automated testing for routing scenarios
- Add regression testing for context preservation
- Create comprehensive test suite for edge cases

---

## Test Execution Checklist

- [ ] Test Case 1: Context Confusion Routing Error
- [ ] Test Case 2: Negative Response Routing Error  
- [ ] Test Case 3: Context Preservation Validation
- [ ] Test Case 4: Intent Recognition Accuracy
- [ ] Test Case 5: Routing Logic Validation

## Notes
- These test cases should be run in isolation to avoid interference
- Each test should be documented with actual vs. expected results
- Performance metrics should be collected for routing decisions
- User experience feedback should be gathered for each scenario
