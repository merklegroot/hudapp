#!/bin/bash

# Step counter script - outputs Step X every 0.5 seconds for 10 steps

printf "$ echo \$PATH\n"
printf "%s\n" "$PATH"

printf "$ for i in {1..10}; do echo \"Step \$i\"; sleep 0.5; done\n"
for i in {1..10}; do
    printf "Step %d\n" "$i"
    sleep 0.5
done

printf "$ echo \"Completed\"\n"
printf "Completed\n"

