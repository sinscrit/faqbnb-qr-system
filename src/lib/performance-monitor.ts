/**
 * Performance monitoring utilities for authentication system
 * Provides real-time performance tracking and analytics
 */

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  operation: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  lastExecution: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;
  private stats: Map<string, PerformanceStats> = new Map();

  /**
   * Start timing an operation
   */
  start(operation: string, metadata?: Record<string, any>): string {
    const metricId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const metric: PerformanceMetric = {
      operation,
      startTime: performance.now(),
      success: false,
      metadata
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    return metricId;
  }

  /**
   * End timing an operation
   */
  end(metricId: string, success: boolean = true, additionalMetadata?: Record<string, any>): void {
    const metric = this.metrics.find(m => `${m.operation}_${Math.floor(m.startTime)}_${metricId.split('_')[2]}` === metricId);

    if (!metric) {
      console.warn(`Performance metric not found: ${metricId}`);
      return;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;

    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    this.updateStats(metric);
  }

  /**
   * Record a complete operation
   */
  record(operation: string, duration: number, success: boolean = true, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      operation,
      startTime: performance.now() - duration,
      endTime: performance.now(),
      duration,
      success,
      metadata
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    this.updateStats(metric);
  }

  /**
   * Update performance statistics
   */
  private updateStats(metric: PerformanceMetric): void {
    const { operation, duration, success } = metric;
    const currentStats = this.stats.get(operation) || {
      operation,
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      successRate: 0,
      lastExecution: 0
    };

    currentStats.count++;
    currentStats.totalDuration += duration!;
    currentStats.averageDuration = currentStats.totalDuration / currentStats.count;
    currentStats.minDuration = Math.min(currentStats.minDuration, duration!);
    currentStats.maxDuration = Math.max(currentStats.maxDuration, duration!);
    currentStats.lastExecution = Date.now();

    // Calculate success rate
    const successCount = this.metrics.filter(m => m.operation === operation && m.success).length;
    currentStats.successRate = (successCount / currentStats.count) * 100;

    this.stats.set(operation, currentStats);
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operation?: string): PerformanceStats[] {
    if (operation) {
      const stats = this.stats.get(operation);
      return stats ? [stats] : [];
    }

    return Array.from(this.stats.values());
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(limit: number = 10): PerformanceMetric[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalOperations: number;
    totalDuration: number;
    averageOperationTime: number;
    successRate: number;
    slowestOperation: string;
    fastestOperation: string;
  } {
    const allMetrics = Array.from(this.stats.values());

    if (allMetrics.length === 0) {
      return {
        totalOperations: 0,
        totalDuration: 0,
        averageOperationTime: 0,
        successRate: 0,
        slowestOperation: 'N/A',
        fastestOperation: 'N/A'
      };
    }

    const totalOperations = allMetrics.reduce((sum, stat) => sum + stat.count, 0);
    const totalDuration = allMetrics.reduce((sum, stat) => sum + stat.totalDuration, 0);
    const averageOperationTime = totalDuration / totalOperations;
    const overallSuccessRate = allMetrics.reduce((sum, stat) => sum + stat.successRate, 0) / allMetrics.length;

    const slowestOperation = allMetrics.reduce((slowest, stat) =>
      stat.averageDuration > slowest.averageDuration ? stat : slowest
    ).operation;

    const fastestOperation = allMetrics.reduce((fastest, stat) =>
      stat.averageDuration < fastest.averageDuration ? stat : fastest
    ).operation;

    return {
      totalOperations,
      totalDuration,
      averageOperationTime,
      successRate: overallSuccessRate,
      slowestOperation,
      fastestOperation
    };
  }

  /**
   * Clear all metrics and stats
   */
  clear(): void {
    this.metrics = [];
    this.stats.clear();
  }

  /**
   * Export performance data for analysis
   */
  export(): {
    metrics: PerformanceMetric[];
    stats: PerformanceStats[];
    summary: ReturnType<PerformanceMonitor['getSummary']>;
  } {
    return {
      metrics: this.metrics,
      stats: Array.from(this.stats.values()),
      summary: this.getSummary()
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common operations
export const startTiming = (operation: string, metadata?: Record<string, any>) =>
  performanceMonitor.start(operation, metadata);

export const endTiming = (metricId: string, success: boolean = true, metadata?: Record<string, any>) =>
  performanceMonitor.end(metricId, success, metadata);

export const recordTiming = (operation: string, duration: number, success: boolean = true, metadata?: Record<string, any>) =>
  performanceMonitor.record(operation, duration, success, metadata);

export const getPerformanceStats = (operation?: string) =>
  performanceMonitor.getStats(operation);

export const getPerformanceSummary = () =>
  performanceMonitor.getSummary();
