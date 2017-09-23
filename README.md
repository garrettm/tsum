# tsum
Typescript sum types with pattern matching, using multimethods

## Example
```
import Sum from 'tsum'
```


Describe each of your types:
```
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
```
interface Animals {
  Dog: Dog
  Cat: Cat
  Chicken: Chicken
  Cow: Cow
}
```

Create a sum type, using the defined interface, and
providing a function to determine type:
```
const Animal = Sum<Animals>({
  typeOf: (animal: any) => {
    if (animal.color !== undefined) { return 'Dog' }
    if (animal.dogFriendly !== undefined) { return 'Cat' }
    if (animal.eggsLaid !== undefined) { return 'Chicken' }
    if (animal.mooVolume !== undefined) { return 'Cow' }
    return null
  }
})
```


Create functions that act on any Animal:
```
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
```
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
```
// Evaluates to Dog | Cat | Chicken | Cow
type Animal = typeof Animal.types
```
