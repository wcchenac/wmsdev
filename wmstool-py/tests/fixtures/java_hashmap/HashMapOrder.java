import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Reads keys (one per line) from stdin, put()s them into a new HashMap in that order and
 * prints keySet() in iteration order. Usage: java HashMapOrder string|long < keys.txt
 * Ground truth for app.javacompat.java_hashmap_order (see make_cases.py).
 */
public class HashMapOrder {
    public static void main(String[] args) throws Exception {
        boolean longs = args.length > 0 && args[0].equals("long");
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
        Map<Object, Integer> map = new HashMap<>();
        String line;
        int i = 0;
        while ((line = in.readLine()) != null) {
            map.put(longs ? (Object) Long.valueOf(line) : line, i++);
        }
        StringBuilder out = new StringBuilder();
        for (Object key : map.keySet()) {
            out.append(key).append('\n');
        }
        System.out.print(out);
    }
}
