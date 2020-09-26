# WHAT iz dis?

hOI!!! frend - dis a proof of meh learning Kotlin.

### Dis format liek Regex gud!!!!!:
```
x           - matches something (can reference it later as x)
(_)         - used for grouping
_|_         - match left or right
_           - matches absolutely anything
!_          - match mustn't include something 
_?          - previous thing optional (0 or 1 times)
_*          - previous thing 0 or many times
_+          - previous thing 1 or more times
{_=n}       - optional something with default value :=n if not provided
... | _     - matches many previous lines until something  

?*+{=_} modify only previous alphanumeric thing, for example:
`$assfuck?` matches anything starting with dollar sign
```