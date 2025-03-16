# simple tool to convert a markdown file with new-lines
# into a one-line string with \n replacements
while True:
    file_name = input('enter file name (must be in this directory): ')

    file = open(file_name, 'r')
    lines = file.readlines()

    single = ''
    for line in lines:
        single = f'{single}{line.replace('    -', '[REPLACE]-').strip().replace('[REPLACE]', '    ')}\\n'
    #print('\n', single, '\n')

    file.close()

    save_file = open('latest.txt', 'w')
    save_file.write(single)
    save_file.close()