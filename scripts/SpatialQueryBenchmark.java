import java.util.Random;

public class SpatialQueryBenchmark {
    static double haversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.asin(Math.sqrt(a));
        return R * c;
    }

    public static void main(String[] args) {
        int n = 100_000;
        double[] lats = new double[n];
        double[] lngs = new double[n];
        Random rnd = new Random(0);
        for (int i = 0; i < n; i++) {
            lats[i] = -90 + 180 * rnd.nextDouble();
            lngs[i] = -180 + 360 * rnd.nextDouble();
        }

        double lat = 37.7749; // San Francisco
        double lng = -122.4194;
        double radiusKm = 50;

        long start = System.currentTimeMillis();
        int count1 = 0;
        for (int i = 0; i < n; i++) {
            if (haversine(lat, lng, lats[i], lngs[i]) <= radiusKm) {
                count1++;
            }
        }
        long noPref = System.currentTimeMillis() - start;

        double latDelta = radiusKm / 111.045d;
        double lngDelta = radiusKm / (111.045d * Math.cos(Math.toRadians(lat)));
        double minLat = lat - latDelta;
        double maxLat = lat + latDelta;
        double minLng = lng - lngDelta;
        double maxLng = lng + lngDelta;

        start = System.currentTimeMillis();
        int count2 = 0;
        for (int i = 0; i < n; i++) {
            if (lats[i] >= minLat && lats[i] <= maxLat && lngs[i] >= minLng && lngs[i] <= maxLng) {
                if (haversine(lat, lng, lats[i], lngs[i]) <= radiusKm) {
                    count2++;
                }
            }
        }
        long withPref = System.currentTimeMillis() - start;

        System.out.println("Matches without bbox: " + count1 + ", time: " + noPref + " ms");
        System.out.println("Matches with bbox: " + count2 + ", time: " + withPref + " ms");
    }
}
