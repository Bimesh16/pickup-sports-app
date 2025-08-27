package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.NearbyExploreController;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

public class NearbyControllerUtilsTest {

    @Test
    void validateCoordinates_acceptsValid() throws Exception {
        Method m = NearbyExploreController.class.getDeclaredMethod("validateCoordinates", double.class, double.class);
        m.setAccessible(true);
        m.invoke(null, 37.7749, -122.4194);
    }

    @Test
    void validateCoordinates_rejectsInvalid() throws Exception {
        Method m = NearbyExploreController.class.getDeclaredMethod("validateCoordinates", double.class, double.class);
        m.setAccessible(true);
        assertThrows(java.lang.reflect.InvocationTargetException.class, () -> m.invoke(null, 100.0, 0.0));
    }

    @Test
    void clamp_int_and_double() throws Exception {
        Method mi = NearbyExploreController.class.getDeclaredMethod("clamp", int.class, int.class, int.class, int.class);
        Method md = NearbyExploreController.class.getDeclaredMethod("clamp", double.class, double.class, double.class, double.class);
        mi.setAccessible(true);
        md.setAccessible(true);

        int ci = (int) mi.invoke(null, 500, 1, 100, 50);
        double cd = (double) md.invoke(null, 999.0, 0.1, 50.0, 5.0);

        assertEquals(100, ci);
        assertEquals(50.0, cd, 0.0001);
    }
}
