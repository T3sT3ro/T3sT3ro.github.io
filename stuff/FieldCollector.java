import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

/**
 * Helps in collecting constants in classes.
 */
public interface FieldCollector {

	/**
	 * Collects all fields of class of given supertype.
	 * Use {@link FieldCollector.Include} on field to mark it for collection.
	 * Use {@link FieldCollector.Include} on class to collect all the fields in class and optionally annotate field with
	 * {@link FieldCollector.Exclude} to exclude it from the collection.
	 *
	 * @param supertype returns values of fields with given supertype
	 * @param <T>       field values supertype
	 * @return pairs of fields with values detected by @Include collector
	 */
	default <T> List<Pair<Field, T>> collect(Class<T> supertype) {
		List<Pair<Field, T>> values = new ArrayList<>();
		try {
			for (Field f : this.getClass().getDeclaredFields()) {

				final boolean isFieldSupertype = supertype.isAssignableFrom(f.getType());
				final boolean shouldInclude = f.isAnnotationPresent(Include.class)
						|| this.getClass().isAnnotationPresent(Include.class);
				final boolean shouldExclude = supertype.isAnnotationPresent(Exclude.class);

				if (isFieldSupertype && shouldInclude && !shouldExclude) {
					f.setAccessible(true);
					values.add(Pair.of(f, (T) f.get(this)));
				}
			}
		} catch (IllegalAccessException e) {
			throw new RuntimeException(e);
		}
		return values;
	}

	/**
	 * Include this field or all fields in class for collection
	 */
	@Target({ElementType.FIELD, ElementType.TYPE})
	@Retention(RetentionPolicy.RUNTIME)
	@interface Include {
	}

	/**
	 * Exclude this field from collection
	 */
	@Target(ElementType.FIELD)
	@Retention(RetentionPolicy.RUNTIME)
	@interface Exclude {
	}
}
