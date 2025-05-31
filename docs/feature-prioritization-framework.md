# ClimaBill Feature Prioritization Framework

## Core Evaluation Criteria (RICE Framework)

Each feature will be scored across four dimensions:

### 1. Reach
How many users will this feature impact in a given time period?

| Score | Criteria |
|-------|----------|
| 1     | <5% of users |
| 2     | 5-20% of users |
| 3     | 21-50% of users |
| 4     | 51-80% of users |
| 5     | >80% of users |

### 2. Impact
How significantly will this feature improve the user experience?

| Score | Criteria |
|-------|----------|
| 1     | Minimal: Nice to have |
| 2     | Low: Minor improvement to existing workflow |
| 3     | Medium: Noticeable improvement to key workflows |
| 4     | High: Significant improvement to core experience |
| 5     | Massive: Game-changing capability |

### 3. Confidence
How confident are we in the estimates for reach and impact?

| Score | Criteria |
|-------|----------|
| 20%   | Pure speculation |
| 40%   | Some evidence from similar features |
| 60%   | Clear evidence from market research |
| 80%   | Strong evidence from user testing |
| 100%  | High certainty based on usage data |

### 4. Effort
How much time will it take to implement?

| Score | Criteria |
|-------|----------|
| 1     | Quick win: 1-3 days |
| 2     | Small: 1-2 weeks |
| 3     | Medium: 3-4 weeks |
| 4     | Large: 1-2 months |
| 5     | XLarge: 2+ months |

### RICE Score Calculation
```
RICE Score = (Reach × Impact × Confidence) ÷ Effort
```

## Strategic Alignment

In addition to the RICE score, each feature is evaluated against strategic objectives:

| Strategic Pillar | Weight |
|------------------|--------|
| Market Differentiation | 30% |
| Revenue Potential | 25% |
| User Retention | 25% |
| Sustainability Impact | 20% |

Strategic Score = Sum of (Pillar Score × Weight)

## User Feedback Integration

User feedback is categorized and weighted as follows:

| Feedback Source | Weight |
|-----------------|--------|
| Enterprise Customers | 35% |
| SMB Customers | 25% |
| Individual Users | 20% |
| Internal Stakeholders | 10% |
| Industry Experts | 10% |

Feedback Score = Sum of (Segment Score × Weight)

## Final Prioritization Formula

```
Final Priority Score = (RICE Score × 0.5) + (Strategic Score × 0.3) + (Feedback Score × 0.2)
```

## Decision Matrix Template

| Feature | Reach | Impact | Confidence | Effort | RICE | Strategic | Feedback | Final Score | Tier |
|---------|-------|--------|------------|--------|------|-----------|----------|-------------|------|
| Feature A | 3 | 4 | 80% | 2 | 4.8 | 4.2 | 3.8 | 4.4 | T1 |
| Feature B | 2 | 5 | 60% | 3 | 2.0 | 4.5 | 4.0 | 3.2 | T2 |

## Priority Tiers

Features are assigned to priority tiers based on their final score:

| Tier | Score Range | Action |
|------|-------------|--------|
| T1 | 4.0-5.0 | Immediate development |
| T2 | 3.0-3.9 | Next sprint planning |
| T3 | 2.0-2.9 | Roadmap (1-3 months) |
| T4 | 1.0-1.9 | Backlog (3-6 months) |
| T5 | <1.0 | Reconsider or drop |

## Implementation Process

1. **Scoring Session**
   - Product team scores each feature candidate
   - Development team validates effort estimates
   - Sales/Customer Success provides feedback data

2. **Priority Review**
   - Bi-weekly review of top 10 features
   - Monthly full backlog re-prioritization
   - Quarterly strategic alignment review

3. **Agile Integration**
   - T1/T2 features automatically included in sprint planning
   - T3 features require capacity planning
   - T4/T5 features revisited only in quarterly reviews

4. **Continuous Validation**
   - Post-implementation impact assessment
   - Score adjustment based on actual metrics
   - Process refinement each quarter

## Example Application: Carbon Tracking Features

| Feature | Reach | Impact | Confidence | Effort | RICE | Strategic | Feedback | Final Score | Tier |
|---------|-------|--------|------------|--------|------|-----------|----------|-------------|------|
| AI-Powered Recommendations | 4 | 5 | 60% | 4 | 3.0 | 4.7 | 4.5 | 3.8 | T2 |
| Real-time Energy Monitoring | 3 | 4 | 80% | 3 | 3.2 | 4.2 | 3.9 | 3.7 | T2 |
| Social Impact Sharing | 5 | 3 | 100% | 1 | 15.0 | 3.5 | 3.2 | 8.4 | T1 |
| Detailed Emissions Reports | 2 | 4 | 80% | 2 | 3.2 | 3.8 | 4.3 | 3.6 | T2 |
| Team Collaboration Tools | 2 | 3 | 60% | 3 | 1.2 | 2.8 | 3.1 | 2.1 | T3 |
