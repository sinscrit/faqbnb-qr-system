/**
 * Load Generator for Performance Tests
 *
 * Creates batches of mock translation jobs with configurable distribution.
 *
 * @module job-queue/__tests__/performance/helpers/load-generator
 * @lastModified 2026-01-21
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Type Definitions
// ============================================================================

export type EntityType = 'item' | 'article' | 'link' | 'tag';
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface LoadGeneratorConfig {
  /** Total number of jobs to create */
  totalJobs: number;
  /** Jobs to create per batch */
  batchSize: number;
  /** Delay between batches in ms */
  batchDelayMs: number;
  /** Entity type distribution (percentages should sum to 1) */
  entityTypeMix: {
    item: number;
    article: number;
    link: number;
    tag: number;
  };
  /** Source/target language pairs */
  languagePairs: Array<{
    source: SupportedLanguage;
    targets: SupportedLanguage[];
  }>;
}

export interface MockEntity {
  id: string;
  type: EntityType;
  sourceLanguage: SupportedLanguage;
  fields: Array<{
    name: string;
    value: string;
  }>;
}

export interface GeneratedJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: 'queued';
  priority: number;
  attempts: number;
  createdAt: string;
}

export interface GeneratedJobsSummary {
  totalCreated: number;
  jobsByType: Record<EntityType, number>;
  jobsByLanguagePair: Record<string, number>;
  jobs: GeneratedJob[];
  errors: string[];
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_LOAD_CONFIG: LoadGeneratorConfig = {
  totalJobs: 100,
  batchSize: 20,
  batchDelayMs: 0,
  entityTypeMix: { item: 0.5, article: 0.3, link: 0.15, tag: 0.05 },
  languagePairs: [
    { source: 'en', targets: ['fr', 'es', 'de', 'nl', 'it'] },
    { source: 'fr', targets: ['en', 'es', 'de', 'nl', 'it'] },
  ],
};

// ============================================================================
// Load Generator Class
// ============================================================================

export class LoadGenerator {
  private config: LoadGeneratorConfig;
  private generatedJobs: GeneratedJob[];
  private errors: string[];

  constructor(config: LoadGeneratorConfig) {
    this.config = config;
    this.generatedJobs = [];
    this.errors = [];
  }

  /**
   * Generate and return all jobs according to config.
   * Does not actually insert into database - returns job data for insertion.
   */
  async generateLoad(): Promise<GeneratedJobsSummary> {
    this.generatedJobs = [];
    this.errors = [];

    const numBatches = Math.ceil(this.config.totalJobs / this.config.batchSize);

    for (let batch = 0; batch < numBatches; batch++) {
      const remainingJobs = this.config.totalJobs - this.generatedJobs.length;
      const batchSize = Math.min(this.config.batchSize, remainingJobs);

      try {
        const batchJobs = await this.generateBatch(batch, batchSize);
        this.generatedJobs.push(...batchJobs);
      } catch (error) {
        this.errors.push(`Batch ${batch} failed: ${error}`);
      }

      if (this.config.batchDelayMs > 0 && batch < numBatches - 1) {
        await this.delay(this.config.batchDelayMs);
      }
    }

    return this.getSummary();
  }

  /**
   * Generate a single batch of jobs.
   */
  async generateBatch(batchIndex: number, size: number): Promise<GeneratedJob[]> {
    const jobs: GeneratedJob[] = [];

    for (let i = 0; i < size; i++) {
      const entityType = this.selectEntityType();
      const entity = this.createMockEntity(entityType);
      const languagePair = this.selectLanguagePair();
      const targetLanguage = this.selectTargetLanguage(languagePair, entity.sourceLanguage);

      const job: GeneratedJob = {
        id: uuidv4(),
        entityType: entity.type,
        entityId: entity.id,
        sourceLanguage: entity.sourceLanguage,
        targetLanguage,
        status: 'queued',
        priority: this.calculatePriority(entityType),
        attempts: 0,
        createdAt: new Date().toISOString(),
      };

      jobs.push(job);
    }

    return jobs;
  }

  /**
   * Select entity type based on configured distribution.
   */
  private selectEntityType(): EntityType {
    const random = Math.random();
    let cumulative = 0;

    const types: EntityType[] = ['item', 'article', 'link', 'tag'];
    for (const type of types) {
      cumulative += this.config.entityTypeMix[type];
      if (random < cumulative) {
        return type;
      }
    }

    return 'item'; // Default fallback
  }

  /**
   * Create mock entity data for testing.
   */
  private createMockEntity(type: EntityType): MockEntity {
    const id = uuidv4();
    const languagePair = this.selectLanguagePair();

    const fieldsByType: Record<EntityType, Array<{ name: string; value: string }>> = {
      item: [
        { name: 'name', value: `Test Item ${id.slice(0, 8)}` },
        { name: 'description', value: `Description for test item ${id.slice(0, 8)}` },
      ],
      article: [
        { name: 'title', value: `How to use Test Item ${id.slice(0, 8)}` },
        { name: 'description', value: `Step-by-step instructions for ${id.slice(0, 8)}` },
      ],
      link: [
        { name: 'title', value: `Video Guide: ${id.slice(0, 8)}` },
      ],
      tag: [
        { name: 'value', value: `tag-${id.slice(0, 8)}` },
      ],
    };

    return {
      id,
      type,
      sourceLanguage: languagePair.source,
      fields: fieldsByType[type],
    };
  }

  /**
   * Select a random language pair from config.
   */
  private selectLanguagePair(): LoadGeneratorConfig['languagePairs'][0] {
    const index = Math.floor(Math.random() * this.config.languagePairs.length);
    return this.config.languagePairs[index];
  }

  /**
   * Select a target language that differs from source.
   */
  private selectTargetLanguage(
    pair: LoadGeneratorConfig['languagePairs'][0],
    sourceLanguage: SupportedLanguage
  ): SupportedLanguage {
    const availableTargets = pair.targets.filter(t => t !== sourceLanguage);
    const index = Math.floor(Math.random() * availableTargets.length);
    return availableTargets[index] || pair.targets[0];
  }

  /**
   * Calculate job priority based on entity type.
   */
  private calculatePriority(entityType: EntityType): number {
    const priorities: Record<EntityType, number> = {
      item: 100,
      article: 75,
      link: 50,
      tag: 25,
    };
    return priorities[entityType];
  }

  /**
   * Get summary of generated jobs.
   */
  private getSummary(): GeneratedJobsSummary {
    const jobsByType: Record<EntityType, number> = { item: 0, article: 0, link: 0, tag: 0 };
    const jobsByLanguagePair: Record<string, number> = {};

    for (const job of this.generatedJobs) {
      jobsByType[job.entityType]++;
      const pairKey = `${job.sourceLanguage}->${job.targetLanguage}`;
      jobsByLanguagePair[pairKey] = (jobsByLanguagePair[pairKey] || 0) + 1;
    }

    return {
      totalCreated: this.generatedJobs.length,
      jobsByType,
      jobsByLanguagePair,
      jobs: this.generatedJobs,
      errors: this.errors,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createLoadGenerator(config?: Partial<LoadGeneratorConfig>): LoadGenerator {
  return new LoadGenerator({ ...DEFAULT_LOAD_CONFIG, ...config });
}
