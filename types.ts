
export type ProtectedAttribute = 'Gender' | 'Race' | 'Age' | 'Religion' | 'Disability' | 'Sexual Orientation';

export interface FairnessMetricScore {
    group: string;
    score: number;
}

export interface FairnessMetric {
    name: string;
    description: string;
    scores: FairnessMetricScore[];
}

export interface MitigationStrategy {
    name: string;
    description: string;
    before_after_metrics: {
        before: FairnessMetricScore[];
        after: FairnessMetricScore[];
    };
    metric_name: string;
}

export interface EthicsFrameworkPrinciple {
    name: string;
    description: string;
}

export interface EthicsFramework {
    title: string;
    principles: EthicsFrameworkPrinciple[];
}

export interface AnalysisResult {
    summary: string;
    fairness_metrics: FairnessMetric[];
    mitigation_strategies: MitigationStrategy[];
    dataset_recommendations: string[];
    real_world_implications: string;
    ethics_framework: EthicsFramework;
    ethics_statement: string;
    references: string[];
}
