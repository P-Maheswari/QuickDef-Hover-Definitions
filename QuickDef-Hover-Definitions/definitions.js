/**
 * definitions.js
 * Curated static definitions for framework annotations, decorators, and
 * language keywords that cannot be looked up via npm/PyPI/DevDocs.
 *
 * Structure per entry:
 *   what     – one sentence: what is it?
 *   purpose  – one sentence: what does it do?
 *   example  – shortest valid usage (string)
 *   note     – optional gotcha / tip (string | null)
 *   docs     – official documentation URL
 *   lang     – language / framework label shown in tooltip header
 */

const DEFINITIONS = {

  // ── Java / Spring Boot ──────────────────────────────────────────────────────
  "@RestController": {
    lang: "Java · Spring",
    what: "Combines @Controller and @ResponseBody into one annotation.",
    purpose: "Marks a class as a REST endpoint where every method returns data directly, not a view.",
    example: "@RestController\npublic class UserController { }",
    note: "Saves annotating every method individually with @ResponseBody.",
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html"
  },
  "@Controller": {
    lang: "Java · Spring",
    what: "Marks a class as an MVC controller that handles web requests.",
    purpose: "Spring detects and registers it as a request handler; methods return view names by default.",
    example: "@Controller\npublic class HomeController { }",
    note: "Use @RestController instead if all methods return JSON/XML.",
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Controller.html"
  },
  "@Service": {
    lang: "Java · Spring",
    what: "Marks a class as a Spring service — a business logic component.",
    purpose: "Triggers auto-detection by component scanning and signals the layer's role to developers.",
    example: "@Service\npublic class PaymentService { }",
    note: "Functionally identical to @Component; the name is purely semantic.",
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Service.html"
  },
  "@Repository": {
    lang: "Java · Spring",
    what: "Marks a class as a Spring data repository (DAO layer).",
    purpose: "Enables exception translation — persistence exceptions are converted to Spring's DataAccessException.",
    example: "@Repository\npublic class UserRepository { }",
    note: "Required for exception translation; skipping it means raw JDBC/JPA exceptions bubble up.",
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Repository.html"
  },
  "@Component": {
    lang: "Java · Spring",
    what: "Generic Spring-managed component annotation.",
    purpose: "Registers a class as a Spring bean, making it available for dependency injection.",
    example: "@Component\npublic class EmailHelper { }",
    note: "Prefer @Service, @Repository, or @Controller for semantic clarity.",
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Component.html"
  },
  "@Autowired": {
    lang: "Java · Spring",
    what: "Injects a Spring-managed bean automatically by type.",
    purpose: "Tells Spring to resolve and inject a matching bean into the annotated field, constructor, or setter.",
    example: "@Autowired\nprivate UserRepository userRepository;",
    note: "Constructor injection is preferred over field injection for testability.",
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/annotation/Autowired.html"
  },
  "@GetMapping": {
    lang: "Java · Spring",
    what: "Shorthand for @RequestMapping(method = RequestMethod.GET).",
    purpose: "Maps HTTP GET requests to a specific handler method.",
    example: "@GetMapping(\"/users/{id}\")\npublic User getUser(@PathVariable Long id) { }",
    note: null,
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/GetMapping.html"
  },
  "@PostMapping": {
    lang: "Java · Spring",
    what: "Shorthand for @RequestMapping(method = RequestMethod.POST).",
    purpose: "Maps HTTP POST requests to a handler method.",
    example: "@PostMapping(\"/users\")\npublic User createUser(@RequestBody User u) { }",
    note: null,
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PostMapping.html"
  },
  "@PutMapping": {
    lang: "Java · Spring",
    what: "Shorthand for @RequestMapping(method = RequestMethod.PUT).",
    purpose: "Maps HTTP PUT requests to a handler method, typically for full resource replacement.",
    example: "@PutMapping(\"/users/{id}\")\npublic User update(@PathVariable Long id, @RequestBody User u) { }",
    note: null,
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PutMapping.html"
  },
  "@DeleteMapping": {
    lang: "Java · Spring",
    what: "Shorthand for @RequestMapping(method = RequestMethod.DELETE).",
    purpose: "Maps HTTP DELETE requests to a handler method.",
    example: "@DeleteMapping(\"/users/{id}\")\npublic void delete(@PathVariable Long id) { }",
    note: null,
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/DeleteMapping.html"
  },
  "@PatchMapping": {
    lang: "Java · Spring",
    what: "Shorthand for @RequestMapping(method = RequestMethod.PATCH).",
    purpose: "Maps HTTP PATCH requests to a handler method, typically for partial updates.",
    example: "@PatchMapping(\"/users/{id}\")\npublic User patch(@PathVariable Long id, @RequestBody Map<String,Object> fields) { }",
    note: null,
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PatchMapping.html"
  },
  "@RequestMapping": {
    lang: "Java · Spring",
    what: "Maps web requests to a controller class or method.",
    purpose: "Defines the URL path, HTTP method, consumes/produces types for request handling.",
    example: "@RequestMapping(value = \"/api\", method = RequestMethod.GET)",
    note: "Prefer the specific shorthand annotations (@GetMapping etc.) on methods.",
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestMapping.html"
  },
  "@RequestBody": {
    lang: "Java · Spring",
    what: "Binds the HTTP request body to a method parameter.",
    purpose: "Spring deserializes the incoming JSON/XML body into the annotated Java object.",
    example: "public User create(@RequestBody User user) { }",
    note: null,
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestBody.html"
  },
  "@PathVariable": {
    lang: "Java · Spring",
    what: "Extracts a value from the URI template.",
    purpose: "Binds a URI path segment to a method parameter.",
    example: "@GetMapping(\"/users/{id}\")\npublic User get(@PathVariable Long id) { }",
    note: null,
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PathVariable.html"
  },
  "@RequestParam": {
    lang: "Java · Spring",
    what: "Extracts a query parameter from the HTTP request URL.",
    purpose: "Binds a URL query string value to a method parameter.",
    example: "public List<User> list(@RequestParam(defaultValue=\"0\") int page) { }",
    note: null,
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestParam.html"
  },
  "@Entity": {
    lang: "Java · JPA",
    what: "Marks a class as a JPA entity mapped to a database table.",
    purpose: "Instructs the JPA provider to manage this class's lifecycle and persist its state.",
    example: "@Entity\npublic class User { @Id Long id; }",
    note: "Must have a no-arg constructor and an @Id field.",
    docs: "https://jakarta.ee/specifications/persistence/3.1/apidocs/jakarta.persistence/jakarta/persistence/entity"
  },
  "@Table": {
    lang: "Java · JPA",
    what: "Specifies the database table an entity maps to.",
    purpose: "Overrides the default table name (which equals the class name).",
    example: "@Entity\n@Table(name = \"users\")\npublic class User { }",
    note: null,
    docs: "https://jakarta.ee/specifications/persistence/3.1/apidocs/jakarta.persistence/jakarta/persistence/table"
  },
  "@Id": {
    lang: "Java · JPA",
    what: "Marks a field as the primary key of the entity.",
    purpose: "Tells JPA which field uniquely identifies each row in the database.",
    example: "@Id\n@GeneratedValue\nprivate Long id;",
    note: null,
    docs: "https://jakarta.ee/specifications/persistence/3.1/apidocs/jakarta.persistence/jakarta/persistence/id"
  },
  "@GeneratedValue": {
    lang: "Java · JPA",
    what: "Specifies that the primary key is auto-generated.",
    purpose: "Delegates ID generation to the database or JPA provider (auto-increment, sequence, etc.).",
    example: "@Id\n@GeneratedValue(strategy = GenerationType.IDENTITY)\nprivate Long id;",
    note: null,
    docs: "https://jakarta.ee/specifications/persistence/3.1/apidocs/jakarta.persistence/jakarta/persistence/generatedvalue"
  },
  "@Column": {
    lang: "Java · JPA",
    what: "Maps a field to a specific database column.",
    purpose: "Overrides column name, nullability, length, uniqueness, and other DDL properties.",
    example: "@Column(name = \"email\", nullable = false, unique = true)\nprivate String email;",
    note: null,
    docs: "https://jakarta.ee/specifications/persistence/3.1/apidocs/jakarta.persistence/jakarta/persistence/column"
  },
  "@Transactional": {
    lang: "Java · Spring",
    what: "Wraps a method or class in a database transaction.",
    purpose: "Automatically commits on success, rolls back on unchecked exceptions.",
    example: "@Transactional\npublic void transfer(Long from, Long to, BigDecimal amt) { }",
    note: "Only applies to public methods called through a Spring proxy — self-invocation is bypassed.",
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Transactional.html"
  },
  "@SpringBootApplication": {
    lang: "Java · Spring Boot",
    what: "Combines @Configuration, @EnableAutoConfiguration, and @ComponentScan.",
    purpose: "Bootstraps a Spring Boot application with sensible defaults in one annotation.",
    example: "@SpringBootApplication\npublic class Application {\n  public static void main(String[] args) { SpringApplication.run(Application.class, args); }\n}",
    note: "Place only on the main class — it scans the current package and sub-packages.",
    docs: "https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/autoconfigure/SpringBootApplication.html"
  },
  "@Configuration": {
    lang: "Java · Spring",
    what: "Marks a class as a source of Spring bean definitions.",
    purpose: "Allows @Bean methods to be declared inside, which Spring registers as managed beans.",
    example: "@Configuration\npublic class AppConfig {\n  @Bean\n  public DataSource dataSource() { ... }\n}",
    note: null,
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Configuration.html"
  },
  "@Bean": {
    lang: "Java · Spring",
    what: "Declares a method as producing a Spring-managed bean.",
    purpose: "The return value of the method is registered as a bean in the application context.",
    example: "@Bean\npublic PasswordEncoder passwordEncoder() {\n  return new BCryptPasswordEncoder();\n}",
    note: "Must be inside a @Configuration class to be proxied correctly.",
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Bean.html"
  },
  "@Value": {
    lang: "Java · Spring",
    what: "Injects a value from application properties or SpEL expressions.",
    purpose: "Reads a property key or evaluates a Spring Expression Language expression into a field.",
    example: "@Value(\"${app.timeout:5000}\")\nprivate int timeout;",
    note: "The :5000 syntax provides a default if the property is missing.",
    docs: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/annotation/Value.html"
  },
  "@Slf4j": {
    lang: "Java · Lombok",
    what: "Generates a static SLF4J Logger field in the class.",
    purpose: "Eliminates boilerplate logger declaration; provides a ready-to-use log variable.",
    example: "@Slf4j\npublic class MyService {\n  void run() { log.info(\"started\"); }\n}",
    note: "Requires Lombok on the classpath and annotation processing enabled.",
    docs: "https://projectlombok.org/api/lombok/extern/slf4j/Slf4j"
  },
  "@Data": {
    lang: "Java · Lombok",
    what: "Generates getters, setters, equals, hashCode, and toString automatically.",
    purpose: "Replaces hundreds of lines of boilerplate for plain data-carrying classes.",
    example: "@Data\npublic class User {\n  private String name;\n  private String email;\n}",
    note: "Avoid on JPA entities — generated equals/hashCode can break lazy-loading proxies.",
    docs: "https://projectlombok.org/api/lombok/Data"
  },
  "@Builder": {
    lang: "Java · Lombok",
    what: "Generates a builder pattern for the class.",
    purpose: "Allows constructing objects with a readable fluent API instead of many constructor args.",
    example: "User user = User.builder().name(\"Ana\").email(\"a@b.com\").build();",
    note: "Combine with @AllArgsConstructor and @NoArgsConstructor when also using JPA.",
    docs: "https://projectlombok.org/api/lombok/Builder"
  },
  "@Override": {
    lang: "Java",
    what: "Signals that a method overrides a superclass or interface method.",
    purpose: "Triggers a compile-time error if the method doesn't actually override anything, catching typos.",
    example: "@Override\npublic String toString() { return name; }",
    note: "Always use it — it's free safety with no runtime cost.",
    docs: "https://docs.oracle.com/en/java/docs/api/java.base/java/lang/Override.html"
  },
  "public": {
    lang: "Java",
    what: "Access modifier — visible from any other class.",
    purpose: "Exposes types and members across packages; typical for API surfaces and REST controllers.",
    example: "public class UserController { }",
    note: null,
    docs: "https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html"
  },
  "private": {
    lang: "Java",
    what: "Access modifier — visible only inside the declaring class.",
    purpose: "Hides implementation details and enforces encapsulation.",
    example: "private final UserRepository repo;",
    note: null,
    docs: "https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html"
  },
  "protected": {
    lang: "Java",
    what: "Access modifier — visible in the class, its package, and subclasses.",
    purpose: "Allows inheritance hierarchies to access members without making them fully public.",
    example: "protected void onInit() { }",
    note: null,
    docs: "https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html"
  },
  "package": {
    lang: "Java",
    what: "Declares the namespace (package) for the compilation unit.",
    purpose: "Groups related types and must match the directory structure under src/main/java.",
    example: "package com.example.app;",
    note: "First non-comment line in a .java file (except module-info).",
    docs: "https://docs.oracle.com/javase/tutorial/java/package/namingpkgs.html"
  },
  "class": {
    lang: "Java",
    what: "Keyword that defines a reference type (a class).",
    purpose: "Bundles fields and methods into one unit; instantiated with new.",
    example: "public class UserService { }",
    note: null,
    docs: "https://docs.oracle.com/javase/tutorial/java/javaOO/classes.html"
  },
  "static": {
    lang: "Java",
    what: "Modifier for members that belong to the class, not instances.",
    purpose: "Shared state or utility methods without creating an object.",
    example: "public static void main(String[] args) { }",
    note: null,
    docs: "https://docs.oracle.com/javase/tutorial/java/javaOO/classvars.html"
  },
  "final": {
    lang: "Java",
    what: "Modifier meaning cannot be changed (variable), overridden (method), or extended (class).",
    purpose: "Enforces immutability and design constraints.",
    example: "private final String id;",
    note: null,
    docs: "https://docs.oracle.com/javase/tutorial/java/IandI/final.html"
  },
  "void": {
    lang: "Java",
    what: "Return type meaning the method returns no value.",
    purpose: "Used for procedures and event handlers that only perform side effects.",
    example: "public void save(User u) { }",
    note: null,
    docs: "https://docs.oracle.com/javase/tutorial/java/javaOO/returnvalue.html"
  },

  // ── Python ──────────────────────────────────────────────────────────────────
  "@staticmethod": {
    lang: "Python",
    what: "Declares a method that belongs to the class but takes no implicit first argument.",
    purpose: "Useful for utility functions logically grouped with a class but not needing instance or class state.",
    example: "class Math:\n  @staticmethod\n  def add(a, b): return a + b",
    note: "Cannot access instance (self) or class (cls) — use @classmethod if you need the class.",
    docs: "https://docs.python.org/3/library/functions.html#staticmethod"
  },
  "@classmethod": {
    lang: "Python",
    what: "Declares a method that receives the class (not the instance) as its first argument.",
    purpose: "Commonly used as an alternative constructor or factory method.",
    example: "class User:\n  @classmethod\n  def from_dict(cls, d): return cls(**d)",
    note: "The first parameter is conventionally named cls.",
    docs: "https://docs.python.org/3/library/functions.html#classmethod"
  },
  "@property": {
    lang: "Python",
    what: "Turns a method into a read-only attribute accessed without parentheses.",
    purpose: "Allows computed attributes with getter/setter/deleter control while keeping dot-access syntax.",
    example: "class Circle:\n  @property\n  def area(self): return 3.14 * self.r ** 2",
    note: "Add a @name.setter method to make the property writable.",
    docs: "https://docs.python.org/3/library/functions.html#property"
  },
  "@abstractmethod": {
    lang: "Python · abc",
    what: "Marks a method as abstract — subclasses must implement it.",
    purpose: "Prevents instantiating the base class directly and enforces the interface contract.",
    example: "from abc import ABC, abstractmethod\nclass Shape(ABC):\n  @abstractmethod\n  def area(self): ...",
    note: "The class must also inherit from ABC (or ABCMeta) for enforcement to work.",
    docs: "https://docs.python.org/3/library/abc.html#abc.abstractmethod"
  },
  "@dataclass": {
    lang: "Python",
    what: "Auto-generates __init__, __repr__, and __eq__ for a class based on its fields.",
    purpose: "Eliminates boilerplate for data-holding classes while remaining a plain Python class.",
    example: "from dataclasses import dataclass\n@dataclass\nclass Point:\n  x: float\n  y: float",
    note: "Add frozen=True to make it immutable (and hashable).",
    docs: "https://docs.python.org/3/library/dataclasses.html"
  },
  "@app.route": {
    lang: "Python · Flask",
    what: "Registers a function as a Flask URL route handler.",
    purpose: "Maps a URL path (and optionally HTTP methods) to a view function.",
    example: "@app.route('/users', methods=['GET', 'POST'])\ndef users(): return jsonify([])",
    note: "Variable rules use <type:name> syntax, e.g. /user/<int:id>.",
    docs: "https://flask.palletsprojects.com/en/latest/api/#flask.Flask.route"
  },
  "@pytest.fixture": {
    lang: "Python · pytest",
    what: "Marks a function as a pytest fixture — reusable setup/teardown logic.",
    purpose: "Fixtures are injected by name into test function parameters automatically.",
    example: "@pytest.fixture\ndef db():\n  conn = create_connection()\n  yield conn\n  conn.close()",
    note: "Use scope='session' to share a fixture across the entire test run.",
    docs: "https://docs.pytest.org/en/stable/reference/fixtures.html"
  },
  "@pytest.mark.parametrize": {
    lang: "Python · pytest",
    what: "Runs a test function multiple times with different argument sets.",
    purpose: "Removes repetitive test functions by parameterising inputs and expected outputs.",
    example: "@pytest.mark.parametrize('n,expected', [(1,1),(2,4)])\ndef test_square(n, expected): assert n**2 == expected",
    note: null,
    docs: "https://docs.pytest.org/en/stable/how-to/parametrize.html"
  },
  "@login_required": {
    lang: "Python · Flask-Login",
    what: "Decorator that restricts a view to authenticated users only.",
    purpose: "Redirects unauthenticated users to the login page automatically.",
    example: "@app.route('/dashboard')\n@login_required\ndef dashboard(): return render_template('dashboard.html')",
    note: "Requires flask_login.login_manager to be configured with login_view.",
    docs: "https://flask-login.readthedocs.io/en/latest/#flask_login.login_required"
  },
  "@cache": {
    lang: "Python · functools",
    what: "Memoizes a function's results, returning cached values for repeated calls.",
    purpose: "Speeds up pure functions by storing results keyed by arguments (unbounded cache).",
    example: "from functools import cache\n@cache\ndef fib(n): return n if n < 2 else fib(n-1)+fib(n-2)",
    note: "Use @lru_cache(maxsize=N) to limit memory usage.",
    docs: "https://docs.python.org/3/library/functools.html#functools.cache"
  },
  "@lru_cache": {
    lang: "Python · functools",
    what: "Memoizes function results up to a maximum cache size using LRU eviction.",
    purpose: "Avoids recomputing expensive function calls with the same arguments.",
    example: "from functools import lru_cache\n@lru_cache(maxsize=256)\ndef expensive(n): ...",
    note: "All arguments must be hashable — dicts and lists will raise TypeError.",
    docs: "https://docs.python.org/3/library/functools.html#functools.lru_cache"
  },
  "@wraps": {
    lang: "Python · functools",
    what: "Copies the wrapped function's metadata to the wrapper function.",
    purpose: "Preserves __name__, __doc__, and other attributes when writing decorators.",
    example: "from functools import wraps\ndef my_dec(f):\n  @wraps(f)\n  def wrapper(*a, **kw): return f(*a, **kw)\n  return wrapper",
    note: "Always use @wraps inside a decorator — without it, introspection tools break.",
    docs: "https://docs.python.org/3/library/functools.html#functools.wraps"
  },

  // ── TypeScript / Angular ────────────────────────────────────────────────────
  "@Injectable": {
    lang: "TypeScript · Angular",
    what: "Marks a class as available for Angular's dependency injection system.",
    purpose: "Allows Angular to create and inject an instance wherever it's needed.",
    example: "@Injectable({ providedIn: 'root' })\nexport class AuthService { }",
    note: "providedIn: 'root' creates a singleton for the whole app.",
    docs: "https://angular.dev/api/core/Injectable"
  },
  "@Component": {
    lang: "TypeScript · Angular",
    what: "Declares an Angular component with its template and styles.",
    purpose: "Associates a class with a template and CSS, creating a reusable UI building block.",
    example: "@Component({ selector: 'app-root', templateUrl: './app.component.html' })\nexport class AppComponent { }",
    note: "Every Angular application has at least one root component.",
    docs: "https://angular.dev/api/core/Component"
  },
  "@NgModule": {
    lang: "TypeScript · Angular",
    what: "Declares an Angular module — a cohesive block of related functionality.",
    purpose: "Groups components, directives, and services; controls what is imported and exported.",
    example: "@NgModule({ declarations: [AppComponent], imports: [BrowserModule], bootstrap: [AppComponent] })\nexport class AppModule { }",
    note: "Modern Angular prefers standalone components, making NgModule optional.",
    docs: "https://angular.dev/api/core/NgModule"
  },
  "@Input": {
    lang: "TypeScript · Angular",
    what: "Declares a property as an input that a parent component can bind to.",
    purpose: "Allows data to flow downward from a parent to a child component.",
    example: "@Input() title: string = '';",
    note: "Use required: true (Angular 16+) to enforce the binding at compile time.",
    docs: "https://angular.dev/api/core/Input"
  },
  "@Output": {
    lang: "TypeScript · Angular",
    what: "Declares an EventEmitter that the parent can listen to.",
    purpose: "Allows data to flow upward from a child to a parent component via events.",
    example: "@Output() clicked = new EventEmitter<void>();",
    note: null,
    docs: "https://angular.dev/api/core/Output"
  },
  "@HostListener": {
    lang: "TypeScript · Angular",
    what: "Binds a host element event to a class method.",
    purpose: "Listens to DOM events on the host element without manually adding/removing listeners.",
    example: "@HostListener('click', ['$event'])\nonClick(e: MouseEvent) { }",
    note: null,
    docs: "https://angular.dev/api/core/HostListener"
  },
  "@Pipe": {
    lang: "TypeScript · Angular",
    what: "Declares a class as an Angular pipe for template transformations.",
    purpose: "Allows data to be transformed inline in templates using the | operator.",
    example: "@Pipe({ name: 'truncate' })\nexport class TruncatePipe implements PipeTransform { }",
    note: "Pure pipes only re-run when the input reference changes — use impure: true carefully.",
    docs: "https://angular.dev/api/core/Pipe"
  },

  // ── NestJS ──────────────────────────────────────────────────────────────────
  "@Module": {
    lang: "TypeScript · NestJS",
    what: "Declares a NestJS module — a logical unit grouping providers and controllers.",
    purpose: "Organises the app into cohesive feature boundaries; controls the DI scope.",
    example: "@Module({ controllers: [UserController], providers: [UserService] })\nexport class UserModule { }",
    note: null,
    docs: "https://docs.nestjs.com/modules"
  },
  "@Controller": {
    lang: "TypeScript · NestJS",
    what: "Marks a class as a NestJS route controller.",
    purpose: "Groups related route handlers under a common URL prefix.",
    example: "@Controller('users')\nexport class UserController { }",
    note: null,
    docs: "https://docs.nestjs.com/controllers"
  },
  "@Get": {
    lang: "TypeScript · NestJS",
    what: "Maps an HTTP GET request to a controller method.",
    purpose: "Registers the method as the handler for GET requests at the given path.",
    example: "@Get(':id')\nfindOne(@Param('id') id: string) { }",
    note: null,
    docs: "https://docs.nestjs.com/controllers#routing"
  },
  "@Post": {
    lang: "TypeScript · NestJS",
    what: "Maps an HTTP POST request to a controller method.",
    purpose: "Registers the method as the handler for POST requests at the given path.",
    example: "@Post()\ncreate(@Body() dto: CreateUserDto) { }",
    note: null,
    docs: "https://docs.nestjs.com/controllers#routing"
  },

  // ── React (hooks) ───────────────────────────────────────────────────────────
  "useState": {
    lang: "JavaScript · React",
    what: "A React Hook that adds local state to a functional component.",
    purpose: "Returns a stateful value and a setter function; re-renders the component when state changes.",
    example: "const [count, setCount] = useState(0);",
    note: "Never mutate state directly — always call the setter.",
    docs: "https://react.dev/reference/react/useState"
  },
  "useEffect": {
    lang: "JavaScript · React",
    what: "A React Hook for running side effects after render.",
    purpose: "Handles data fetching, subscriptions, DOM mutations, and cleanup outside the render cycle.",
    example: "useEffect(() => { fetchData(); }, [id]);",
    note: "Missing dependencies in the array cause stale closures; extra deps cause redundant runs.",
    docs: "https://react.dev/reference/react/useEffect"
  },
  "useContext": {
    lang: "JavaScript · React",
    what: "A React Hook that reads a context value from the nearest provider.",
    purpose: "Avoids prop drilling by subscribing directly to a React context.",
    example: "const theme = useContext(ThemeContext);",
    note: "Every consumer re-renders when the context value changes.",
    docs: "https://react.dev/reference/react/useContext"
  },
  "useRef": {
    lang: "JavaScript · React",
    what: "A React Hook that returns a mutable ref object persisting across renders.",
    purpose: "Holds a value (e.g. DOM element or interval ID) that doesn't trigger a re-render when changed.",
    example: "const inputRef = useRef(null);\ninputRef.current.focus();",
    note: "Changing .current does not cause a re-render — use useState if you need that.",
    docs: "https://react.dev/reference/react/useRef"
  },
  "useMemo": {
    lang: "JavaScript · React",
    what: "A React Hook that memoizes an expensive computed value.",
    purpose: "Re-computes only when listed dependencies change, avoiding redundant calculations.",
    example: "const sorted = useMemo(() => items.sort(), [items]);",
    note: "Don't use prematurely — it adds overhead and complexity.",
    docs: "https://react.dev/reference/react/useMemo"
  },
  "useCallback": {
    lang: "JavaScript · React",
    what: "A React Hook that memoizes a function reference.",
    purpose: "Prevents child components from re-rendering when a callback is passed as a prop.",
    example: "const handleClick = useCallback(() => submit(id), [id]);",
    note: "Pair with React.memo on the child component, otherwise it has no effect.",
    docs: "https://react.dev/reference/react/useCallback"
  },
  "useReducer": {
    lang: "JavaScript · React",
    what: "A React Hook for managing complex state with a reducer function.",
    purpose: "Replaces useState when state logic involves multiple sub-values or complex transitions.",
    example: "const [state, dispatch] = useReducer(reducer, { count: 0 });",
    note: null,
    docs: "https://react.dev/reference/react/useReducer"
  },
  "useLayoutEffect": {
    lang: "JavaScript · React",
    what: "Like useEffect but fires synchronously after all DOM mutations.",
    purpose: "Reads DOM layout and synchronously re-renders before the browser paints.",
    example: "useLayoutEffect(() => {\n  const h = ref.current.getBoundingClientRect().height;\n  setHeight(h);\n}, []);",
    note: "Prefer useEffect when possible — useLayoutEffect blocks visual updates.",
    docs: "https://react.dev/reference/react/useLayoutEffect"
  },
  "useNavigate": {
    lang: "JavaScript · React Router",
    what: "A React Router hook that returns a navigation function.",
    purpose: "Programmatically navigates to a route without a <Link> element.",
    example: "const navigate = useNavigate();\nnavigate('/dashboard');",
    note: "Pass { replace: true } to replace the current history entry instead of pushing.",
    docs: "https://reactrouter.com/en/main/hooks/use-navigate"
  },
  "useParams": {
    lang: "JavaScript · React Router",
    what: "A React Router hook that returns URL path parameters.",
    purpose: "Reads dynamic segments from the current route URL.",
    example: "const { id } = useParams();\n// URL: /users/:id",
    note: null,
    docs: "https://reactrouter.com/en/main/hooks/use-params"
  },

  // ── Go ──────────────────────────────────────────────────────────────────────
  "goroutine": {
    lang: "Go",
    what: "A lightweight thread managed by the Go runtime.",
    purpose: "Enables concurrent execution with very low memory overhead (~2KB stack vs ~8MB for OS threads).",
    example: "go fetchUser(id)  // runs concurrently",
    note: "Goroutines are multiplexed onto OS threads by the Go scheduler automatically.",
    docs: "https://go.dev/doc/effective_go#goroutines"
  },
  "defer": {
    lang: "Go",
    what: "Schedules a function call to run when the surrounding function returns.",
    purpose: "Used for cleanup — closing files, releasing locks, or logging — regardless of how the function exits.",
    example: "f, _ := os.Open(\"file.txt\")\ndefer f.Close()",
    note: "Deferred calls are executed in LIFO (last-in, first-out) order.",
    docs: "https://go.dev/ref/spec#Defer_statements"
  },
  "chan": {
    lang: "Go",
    what: "A channel — a typed conduit for communication between goroutines.",
    purpose: "Allows goroutines to send and receive values safely without shared memory.",
    example: "ch := make(chan int, 10)\nch <- 42\nv := <-ch",
    note: "Unbuffered channels block until both sender and receiver are ready.",
    docs: "https://go.dev/ref/spec#Channel_types"
  },
  "interface": {
    lang: "Go",
    what: "A type that defines a set of method signatures.",
    purpose: "Enables polymorphism — any type implementing the methods satisfies the interface implicitly.",
    example: "type Stringer interface { String() string }",
    note: "Go uses structural (implicit) typing — no 'implements' keyword needed.",
    docs: "https://go.dev/ref/spec#Interface_types"
  },

  // ── Rust ────────────────────────────────────────────────────────────────────
  "impl": {
    lang: "Rust",
    what: "Defines method implementations for a struct or trait.",
    purpose: "Associates functions and methods with a type, or implements a trait for a type.",
    example: "impl User {\n  fn greet(&self) -> String { format!(\"Hi {}\", self.name) }\n}",
    note: null,
    docs: "https://doc.rust-lang.org/std/keyword.impl.html"
  },
  "trait": {
    lang: "Rust",
    what: "Defines a set of methods a type must implement (similar to an interface).",
    purpose: "Enables shared behaviour and polymorphism across different types.",
    example: "trait Greet { fn hello(&self) -> String; }",
    note: "Rust uses traits for operator overloading, iteration, and more via std traits.",
    docs: "https://doc.rust-lang.org/book/ch10-02-traits.html"
  },
  "unsafe": {
    lang: "Rust",
    what: "A block or function that opts out of Rust's memory safety guarantees.",
    purpose: "Allows raw pointer dereferencing, calling unsafe functions, and implementing unsafe traits.",
    example: "unsafe { *ptr = 42; }",
    note: "Minimise unsafe blocks and document invariants — the compiler can't help you here.",
    docs: "https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html"
  },
  "async": {
    lang: "Rust / JS / Python / C#",
    what: "Marks a function as asynchronous — it returns a Future/Promise/Coroutine.",
    purpose: "Allows non-blocking I/O and concurrent execution without OS threads.",
    example: "async fn fetch(url: &str) -> Result<String> { ... }  // Rust\nasync function load() { }  // JS",
    note: "In Rust, an async fn must be awaited inside an async runtime (e.g. Tokio).",
    docs: "https://doc.rust-lang.org/std/keyword.async.html"
  },
  "await": {
    lang: "Rust / JS / Python / C#",
    what: "Suspends the current async function until a Future/Promise resolves.",
    purpose: "Allows asynchronous code to be written in a linear, readable style.",
    example: "let data = fetch(url).await?;  // Rust\nconst data = await fetch(url);  // JS",
    note: "In JS, unhandled rejected promises from await propagate as unhandled exceptions.",
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await"
  },

  // ── Kotlin / Android ────────────────────────────────────────────────────────
  "suspend": {
    lang: "Kotlin",
    what: "Marks a function as a coroutine — it can be paused and resumed.",
    purpose: "Allows non-blocking async code without callbacks or explicit thread management.",
    example: "suspend fun fetchUser(id: Int): User { return api.getUser(id) }",
    note: "Suspend functions can only be called from another suspend function or a coroutine scope.",
    docs: "https://kotlinlang.org/docs/coroutines-basics.html"
  },
  "data class": {
    lang: "Kotlin",
    what: "A class that automatically generates equals, hashCode, toString, and copy.",
    purpose: "Eliminates boilerplate for value/DTO objects.",
    example: "data class User(val name: String, val email: String)",
    note: "All primary constructor params should be val — mutable data classes cause bugs.",
    docs: "https://kotlinlang.org/docs/data-classes.html"
  },

  // ── Docker / YAML ───────────────────────────────────────────────────────────
  "FROM": {
    lang: "Dockerfile",
    what: "Sets the base image for a Docker build stage.",
    purpose: "Every Dockerfile must start with FROM — it defines the OS and tools available.",
    example: "FROM node:20-alpine",
    note: "Use specific tags (not latest) for reproducible builds.",
    docs: "https://docs.docker.com/reference/dockerfile/#from"
  },
  "RUN": {
    lang: "Dockerfile",
    what: "Executes a command in a new layer during the image build.",
    purpose: "Used to install packages, compile code, or configure the environment.",
    example: "RUN apt-get update && apt-get install -y curl",
    note: "Chain commands with && to minimise layers and image size.",
    docs: "https://docs.docker.com/reference/dockerfile/#run"
  },
  "COPY": {
    lang: "Dockerfile",
    what: "Copies files from the build context into the image.",
    purpose: "Transfers application source code or config files into the container.",
    example: "COPY package*.json ./\nCOPY . .",
    note: "Use .dockerignore to exclude node_modules and other large dirs.",
    docs: "https://docs.docker.com/reference/dockerfile/#copy"
  },
  "EXPOSE": {
    lang: "Dockerfile",
    what: "Documents the port the container listens on at runtime.",
    purpose: "Metadata only — tells users and orchestrators which port the app uses.",
    example: "EXPOSE 8080",
    note: "EXPOSE doesn't publish the port — use -p in docker run or ports: in Compose.",
    docs: "https://docs.docker.com/reference/dockerfile/#expose"
  },
  "CMD": {
    lang: "Dockerfile",
    what: "Sets the default command executed when the container starts.",
    purpose: "Defines what process runs as PID 1 in the container.",
    example: "CMD [\"node\", \"server.js\"]",
    note: "Use exec form (JSON array) to avoid shell signal-handling issues.",
    docs: "https://docs.docker.com/reference/dockerfile/#cmd"
  },

  // ── SQL ─────────────────────────────────────────────────────────────────────
  "JOIN": {
    lang: "SQL",
    what: "Combines rows from two or more tables based on a related column.",
    purpose: "Retrieves related data stored in separate tables in a single query.",
    example: "SELECT u.name, o.total\nFROM users u\nJOIN orders o ON u.id = o.user_id;",
    note: "Default JOIN is INNER JOIN — only returns rows with matches in both tables.",
    docs: "https://www.postgresql.org/docs/current/tutorial-join.html"
  },
  "GROUP BY": {
    lang: "SQL",
    what: "Groups rows sharing a value so aggregate functions apply per group.",
    purpose: "Used with COUNT, SUM, AVG, MAX, MIN to summarise data by category.",
    example: "SELECT dept, COUNT(*) FROM employees GROUP BY dept;",
    note: "Every column in SELECT must be either in GROUP BY or inside an aggregate.",
    docs: "https://www.postgresql.org/docs/current/sql-select.html#SQL-GROUPBY"
  },
  "HAVING": {
    lang: "SQL",
    what: "Filters groups after GROUP BY — like WHERE but for aggregated results.",
    purpose: "Applies conditions to grouped rows that WHERE cannot (WHERE runs before grouping).",
    example: "SELECT dept, COUNT(*) FROM employees\nGROUP BY dept\nHAVING COUNT(*) > 5;",
    note: null,
    docs: "https://www.postgresql.org/docs/current/sql-select.html#SQL-HAVING"
  },
  "INDEX": {
    lang: "SQL",
    what: "A data structure that speeds up row lookups on a table column.",
    purpose: "Avoids full table scans, dramatically improving query performance on large tables.",
    example: "CREATE INDEX idx_email ON users(email);",
    note: "Indexes speed up reads but slow down writes — don't index every column.",
    docs: "https://www.postgresql.org/docs/current/sql-createindex.html"
  },
  "DISTINCT": {
    lang: "SQL",
    what: "Eliminates duplicate rows from a query result.",
    purpose: "Returns only unique values for the selected columns.",
    example: "SELECT DISTINCT country FROM users;",
    note: "DISTINCT is applied after all other clauses; it can be slow on large result sets.",
    docs: "https://www.postgresql.org/docs/current/sql-select.html#SQL-DISTINCT"
  },

  // ── JavaScript / TypeScript general ────────────────────────────────────────
  "Promise": {
    lang: "JavaScript",
    what: "An object representing the eventual completion or failure of an async operation.",
    purpose: "Allows chaining async operations with .then()/.catch() instead of nested callbacks.",
    example: "fetch(url).then(r => r.json()).catch(console.error);",
    note: "Unhandled rejections crash Node.js processes — always add .catch() or try/await.",
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise"
  },
  "Symbol": {
    lang: "JavaScript",
    what: "A primitive type that produces a unique, immutable identifier.",
    purpose: "Used as object property keys that won't conflict with other keys (including strings).",
    example: "const id = Symbol('id');\nobj[id] = 42;",
    note: "Symbols are not enumerated by for...in or Object.keys().",
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol"
  },
  "Proxy": {
    lang: "JavaScript",
    what: "Wraps an object and intercepts fundamental operations on it.",
    purpose: "Allows custom behaviour for property access, assignment, and more — used by Vue 3 and MobX.",
    example: "const p = new Proxy(target, { get(t, k) { return k in t ? t[k] : 'default'; } });",
    note: null,
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy"
  },
  "WeakMap": {
    lang: "JavaScript",
    what: "A Map whose keys are weakly referenced objects — they don't prevent garbage collection.",
    purpose: "Associates data with an object without preventing the object from being garbage collected.",
    example: "const cache = new WeakMap();\ncache.set(domEl, computedData);",
    note: "Keys must be objects; primitives are not allowed as WeakMap keys.",
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap"
  }
};

// Export for use in content.js (via global window or module)
if (typeof module !== "undefined") module.exports = DEFINITIONS;
globalThis.DEFINITIONS = DEFINITIONS;

