# Spatial Query Benchmark

A simple Java benchmark compares distance calculations with and without a bounding-box prefilter.

```bash
javac scripts/SpatialQueryBenchmark.java
java -cp scripts SpatialQueryBenchmark
```

### Results

```
Matches without bbox: 2, time: 17 ms
Matches with bbox: 2, time: 1 ms
```

The bounding-box prefilter avoids most distance calculations, yielding roughly a 17× speedup on 100,000 random points.
