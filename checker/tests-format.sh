for filename in out_correct/*; do 
    [ -f "$filename" ] || continue
    mv $filename ${filename//.out/}
done

for filename in tests/*; do 
    [ -f "$filename" ] || continue
    mv $filename ${filename//.in/}
done
