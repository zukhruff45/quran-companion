npx tsc --noEmit 2>&1 | tee /tmp/tsc_output.txt
echo "EXIT CODE: $?"
wc -l /tmp/tsc_output.txt
