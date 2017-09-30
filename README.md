# tsum
Typescript sum types with pattern matching, using multimethods

## Install
`npm install --save tsum`

`yarn add tsum`

## Motivation
Being able to simply represent, manipulate, and pattern match on immutable values is one of the most important things a programming language can provide.

Typescript offers two built-in solutions:
1. Add a 'type' field to all your data, and switch on it.  This is verbose, requires explicit serialize/deserialize, and error prone when specifying literal data.  Additionally, switch offers no exhaustiveness guarantee, and is a statement rather than an expression.
2. Put your data into classes.  This is verbose, requires explicit serialize/deserialize and lacks named fields:  
`new Person('Garrett')` vs `{name: 'Garrett'}`  
Most importantly, you lose the ability to easily make new immutable values from previous values.

Using plain data structures solves many of these problems, and improves notation:
- values are trivial to persist or send over a wire, and trivial to read when receiving data from the wire or disk
- data definitions are as terse and straightforward as possible in Typescript
- fields are named
- open system, as long as a piece of data matches one of these interfaces, it can participate in this polymorphism (unlike classes)
- matching every possible case is enforced by the compiler, and matches are expressions which return a value
- critically, you gain the ability to use spread notation to immutably produce new values: `{...person, name: 'Oberyn'}`

## Example
```ts
import Sum from 'tsum'
```


Describe each of your types:
```ts
interface Dog {
  name: string
  color: string
}

interface Cat {
  name: string 
  dogFriendly: boolean
}

interface Chicken {
  eggsLaid: number
}

interface Cow {
  mooVolume: number
}
```

Put them together:
```ts
interface Animals {
  Dog: Dog
  Cat: Cat
  Chicken: Chicken
  Cow: Cow
}
```

Provide the Animals interface, along with a set of predicates to determine the type of an arbitrary Animal:
```ts
const Animal = Sum<Animals>({
  predicates: ({isString, isBoolean, isNumber}) => ({
    Dog:     _ => isString(_.color),
    Cat:     _ => isBoolean(_.dogFriendly),
    Chicken: _ => isNumber(_.eggsLaid),
    Cow:     _ => isNumber(_.mooVolume)
  })
})
```


Create functions that act on any Animal:
```ts
// The type of describe is: (animal: Animal) => string
const describe = Animal.f({
  // here Typescript knows that `dog` is of type Dog
  Dog: dog => `a ${dog.color} dog named ${dog.name}`,
  Cat: cat => cat.dogFriendly ? `a cat named ${cat.name} (dog-friendly)` : `a cat named ${cat.name} (not dog-friendly)`,
  Chicken: chicken => `a chicken who has laid ${chicken.eggsLaid} eggs`,
  Cow: cow => cow.mooVolume > 5 ? 'a loud cow' : 'a quiet cow'
})

const dog = {name: 'Zorro', color: 'grey'}
const cat = {name: 'Oberyn', dogFriendly: false}
const chicken = {eggsLaid: 13}
const cow = {mooVolume: 6}

console.log(describe(dog))     // a grey dog named Zorro
console.log(describe(cat))     // a cat named Oberyn (not dog-friendly)
console.log(describe(chicken)) // a chicken who has laid 13 eggs
console.log(describe(cow))     // a loud cow
```

Or match inline:
```ts
const cat = {name: 'Oberyn', dogFriendly: false}
const cost = Animal.match(cat, {
  Dog: dog => dog.name === 'Zorro' ? 99999 : 300,
  Cat: cat => cat.name === 'Oberyn' ? 99999 : 800,
  Chicken: chicken => chicken.eggsLaid * 10,
  Cow: cow => cow.mooVolume > 5 ? 5000 : 6000
})
console.log(cost) // 99999
```

Convenience to avoid repeating yourself:
```ts
// Evaluates to Dog | Cat | Chicken | Cow
type Animal = typeof Animal.types
```

## Thanks to:
[The Value of Values](https://www.youtube.com/watch?v=-6BsiVyC1kM)
